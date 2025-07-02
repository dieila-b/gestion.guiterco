
import { supabase } from '@/integrations/supabase/client';
import { createCashTransaction } from './transactionService';
import { updateStockAfterVente } from './stockService';

export const createVenteComptoir = async (venteData: any, cart: any[]) => {
  console.log('🔄 Création vente comptoir avec données:', {
    venteData,
    cart: cart?.length ? cart.length + ' articles' : 'panier vide'
  });

  // Validation des données d'entrée
  if (!venteData) {
    console.error('❌ ERREUR: venteData est undefined');
    throw new Error('Données de vente manquantes');
  }

  if (!venteData.client_id) {
    console.error('❌ ERREUR: client_id manquant dans venteData');
    throw new Error('Client requis pour créer une vente');
  }

  if (!cart || cart.length === 0) {
    console.error('❌ ERREUR: panier vide');
    throw new Error('Le panier ne peut pas être vide');
  }

  try {
    // 1. Créer la commande
    console.log('📝 Création de la commande...');
    const { data: commande, error: commandeError } = await supabase
      .from('commandes_clients')
      .insert({
        numero_commande: `CMD-${Date.now()}`,
        client_id: venteData.client_id,
        montant_ht: venteData.montant_ht || 0,
        tva: venteData.tva || 0,
        montant_ttc: venteData.montant_ttc || 0,
        statut: 'confirmee',
        mode_paiement: venteData.mode_paiement
      })
      .select()
      .single();

    if (commandeError) {
      console.error('❌ Erreur création commande:', commandeError);
      throw commandeError;
    }

    console.log('✅ Commande créée:', commande.numero_commande);

    // 2. *** RÉSOLUTION OBLIGATOIRE DE L'UUID DU PDV ***
    let pdvId = null;
    let pdvNom = 'Non spécifié';
    
    if (venteData.point_vente_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(venteData.point_vente_id)) {
        // C'est déjà un UUID
        pdvId = venteData.point_vente_id;
        
        // Récupérer le nom pour les logs
        const { data: pdvInfo } = await supabase
          .from('points_de_vente')
          .select('nom')
          .eq('id', pdvId)
          .single();
        
        if (pdvInfo) {
          pdvNom = pdvInfo.nom;
        }
      } else {
        // C'est un nom, résoudre l'UUID - OBLIGATOIRE POUR LE STOCK
        console.log('🔍 *** RÉSOLUTION OBLIGATOIRE UUID pour PDV:', venteData.point_vente_id, '***');
        
        const { data: pdvData, error: pdvError } = await supabase
          .from('points_de_vente')
          .select('id, nom')
          .eq('nom', venteData.point_vente_id)
          .single();
        
        if (pdvError || !pdvData) {
          console.error('❌ *** ERREUR CRITIQUE *** Point de vente non trouvé:', venteData.point_vente_id);
          throw new Error(`Point de vente "${venteData.point_vente_id}" non trouvé - Vente annulée`);
        }
        
        pdvId = pdvData.id;
        pdvNom = pdvData.nom;
        console.log('✅ *** UUID PDV RÉSOLU *** :', pdvId, 'pour:', pdvNom);
      }
    } else {
      console.error('❌ *** ERREUR CRITIQUE *** : Aucun point de vente spécifié');
      throw new Error('Point de vente obligatoire pour créer une vente');
    }

    // 3. *** DÉTERMINATION OBLIGATOIRE DU STATUT DE LIVRAISON ***
    let statutLivraisonId = 3; // Par défaut livraison complète (ID 3 = livree)
    
    console.log('📦 *** TRAITEMENT STATUT LIVRAISON ***');
    console.log('📦 Statut demandé dans venteData:', {
      statut_livraison: venteData.statut_livraison,
      delivery_status: venteData.delivery_status
    });
    
    // Si le statut de livraison est fourni dans venteData
    if (venteData.statut_livraison || venteData.delivery_status) {
      const statutDemande = venteData.statut_livraison || venteData.delivery_status;
      console.log('📦 Statut de livraison demandé:', statutDemande);
      
      // Mapping des statuts
      switch (statutDemande) {
        case 'en_attente':
        case 'pending':
          statutLivraisonId = 1;
          break;
        case 'partiellement_livree':
        case 'partial':
          statutLivraisonId = 2;
          break;
        case 'livree':
        case 'complete':
        case 'delivered':
        default:
          statutLivraisonId = 3; // Livraison complète par défaut
          break;
      }
      
      console.log('✅ ID statut livraison défini:', statutLivraisonId, 'pour statut:', statutDemande);
    }

    // 4. *** CRÉATION FACTURE AVEC STATUT LIVRAISON OBLIGATOIRE ***
    console.log('📄 *** CRÉATION FACTURE AVEC STATUT LIVRAISON ***:', statutLivraisonId);
    const { data: facture, error: factureError } = await supabase
      .from('factures_vente')
      .insert({
        numero_facture: 'TEMP', // Sera généré par le trigger
        commande_id: commande.id,
        client_id: venteData.client_id,
        montant_ttc: venteData.montant_ttc || 0,
        montant_ht: venteData.montant_ht || 0,
        tva: venteData.tva || 0,
        statut_paiement: venteData.montant_paye > 0 ? 'payee' : 'en_attente',
        statut_livraison_id: statutLivraisonId, // *** OBLIGATOIRE ***
        mode_paiement: venteData.mode_paiement
      })
      .select()
      .single();

    if (factureError) {
      console.error('❌ Erreur création facture:', factureError);
      throw factureError;
    }

    console.log('✅ *** FACTURE CRÉÉE *** :', facture.numero_facture, 'avec statut_livraison_id:', facture.statut_livraison_id);

    // 5. *** CRÉATION LIGNES FACTURE AVEC STATUTS COHÉRENTS ***
    console.log('📋 *** CRÉATION LIGNES FACTURE ***');
    const lignesFacture = cart.map(item => {
      // Déterminer le statut de livraison pour chaque ligne selon le statut global
      let statutLigneLivraison = 'en_attente';
      let quantiteLivree = 0;
      
      if (statutLivraisonId === 3) { // ID 3 = livree
        statutLigneLivraison = 'livree';
        quantiteLivree = item.quantite;
      } else if (statutLivraisonId === 2) { // ID 2 = partiellement_livree
        statutLigneLivraison = 'partiellement_livree';
        quantiteLivree = Math.floor(item.quantite / 2); // Exemple de livraison partielle
      }
      
      return {
        facture_vente_id: facture.id,
        article_id: item.article_id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        montant_ligne: item.quantite * item.prix_unitaire,
        statut_livraison: statutLigneLivraison,
        quantite_livree: quantiteLivree
      };
    });

    const { error: lignesError } = await supabase
      .from('lignes_facture_vente')
      .insert(lignesFacture);

    if (lignesError) {
      console.error('❌ Erreur création lignes facture:', lignesError);
      throw lignesError;
    }

    console.log('✅ *** LIGNES FACTURE CRÉÉES *** :', lignesFacture.length, 'lignes avec statuts cohérents');

    // 6. *** DÉCRÉMENTATION STOCK OBLIGATOIRE ***
    console.log('📦 *** DÉBUT DÉCRÉMENTATION STOCK OBLIGATOIRE ***');
    console.log('📦 PDV ID résolu:', pdvId);
    console.log('📦 PDV Nom:', pdvNom);
    console.log('📦 Articles à décrémenter:', cart.length);
    
    try {
      const resultatsStock = await updateStockAfterVente(cart, pdvId, pdvNom);
      console.log('✅ *** STOCK DÉCRÉMENTÉ AVEC SUCCÈS *** :', resultatsStock.length, 'articles traités');
    } catch (stockError) {
      console.error('❌ *** ERREUR CRITIQUE STOCK *** :', stockError);
      // *** ANNULER LA VENTE SI LE STOCK NE PEUT PAS ÊTRE MIS À JOUR ***
      throw new Error('Vente annulée - Stock non décrémenté : ' + stockError.message);
    }

    // 7. *** TRANSACTION CAISSE AUTOMATIQUE ***
    if (venteData.montant_paye && venteData.montant_paye > 0) {
      console.log('💰 *** CRÉATION TRANSACTION CAISSE *** :', venteData.montant_paye);
      
      try {
        await createCashTransaction({
          montant_paye: venteData.montant_paye,
          mode_paiement: venteData.mode_paiement,
          notes: venteData.notes,
          client_id: venteData.client_id
        }, facture.numero_facture);
        
        console.log('✅ *** TRANSACTION CAISSE CRÉÉE ***');
      } catch (transactionError) {
        console.error('❌ ERREUR transaction caisse:', transactionError);
        // Ne pas faire échouer la vente pour un problème de caisse
      }
    }

    // 8. *** VERSEMENT CLIENT ***
    if (venteData.montant_paye > 0) {
      console.log('💳 *** CRÉATION VERSEMENT *** :', venteData.montant_paye);
      const { error: versementError } = await supabase
        .from('versements_clients')
        .insert({
          client_id: venteData.client_id,
          facture_id: facture.id,
          montant: venteData.montant_paye,
          mode_paiement: venteData.mode_paiement,
          numero_versement: `VERS-${facture.numero_facture}`,
          date_versement: new Date().toISOString(),
          observations: venteData.notes || 'Paiement vente comptoir'
        });

      if (versementError) {
        console.error('❌ Erreur versement:', versementError);
      } else {
        console.log('✅ *** VERSEMENT CRÉÉ ***');
      }
    }

    console.log('🎉 *** VENTE COMPTOIR CRÉÉE AVEC SUCCÈS ***');
    console.log('📋 Facture:', facture.numero_facture);
    console.log('📦 Stock décrémenté pour PDV:', pdvNom, '(UUID:', pdvId, ')');
    console.log('🚚 Statut livraison ID:', statutLivraisonId);
    
    return { facture, commande };

  } catch (error) {
    console.error('❌ *** ERREUR VENTE COMPTOIR *** :', error);
    throw error;
  }
};
