
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

    // 2. Déterminer le statut de livraison correct
    let statutLivraisonId = 1; // Par défaut en_attente
    
    // Si le statut de livraison est fourni dans venteData
    if (venteData.statut_livraison || venteData.delivery_status) {
      const statutDemande = venteData.statut_livraison || venteData.delivery_status;
      console.log('📦 Statut de livraison demandé:', statutDemande);
      
      // Récupérer l'ID du statut depuis la table livraison_statut
      const { data: statutData, error: statutError } = await supabase
        .from('livraison_statut')
        .select('id')
        .eq('nom', statutDemande === 'complete' || statutDemande === 'livree' ? 'livree' : statutDemande)
        .single();

      if (!statutError && statutData) {
        statutLivraisonId = statutData.id;
        console.log('✅ ID statut livraison trouvé:', statutLivraisonId, 'pour statut:', statutDemande);
      } else {
        console.warn('⚠️ Statut livraison non trouvé, utilisation du défaut (en_attente)');
      }
    }

    // 3. Créer la facture avec le bon statut de livraison
    console.log('📄 Création de la facture avec statut_livraison_id:', statutLivraisonId);
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
        statut_livraison_id: statutLivraisonId, // Utiliser l'ID correct
        mode_paiement: venteData.mode_paiement
      })
      .select()
      .single();

    if (factureError) {
      console.error('❌ Erreur création facture:', factureError);
      throw factureError;
    }

    console.log('✅ Facture créée:', facture.numero_facture, 'avec statut_livraison_id:', facture.statut_livraison_id);

    // 4. Créer les lignes de facture avec le bon statut de livraison
    console.log('📋 Création des lignes de facture...');
    const lignesFacture = cart.map(item => {
      // Déterminer le statut de livraison pour chaque ligne
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

    console.log('✅ Lignes de facture créées:', lignesFacture.length + ' lignes avec statuts de livraison');

    // 5. *** MISE À JOUR STOCK OBLIGATOIRE *** - Toujours décrémenter le stock
    if (venteData.point_vente_id) {
      console.log('📦 *** DÉCRÉMENTATION STOCK OBLIGATOIRE ***');
      try {
        await updateStockAfterVente(cart, venteData.point_vente_id, 'Point de vente');
        console.log('✅ Stock décrémenté avec succès');
      } catch (stockError) {
        console.error('❌ ERREUR CRITIQUE: Stock non décrémenté:', stockError);
        // Ne pas faire échouer la vente mais alerter
        throw new Error('Vente créée mais stock non mis à jour: ' + stockError.message);
      }
    }

    // 6. Créer la transaction de caisse AUTOMATIQUEMENT
    if (venteData.montant_paye && venteData.montant_paye > 0) {
      console.log('💰 Création transaction caisse automatique pour vente:', venteData.montant_paye);
      
      try {
        await createCashTransaction({
          montant_paye: venteData.montant_paye,
          mode_paiement: venteData.mode_paiement,
          notes: venteData.notes,
          client_id: venteData.client_id
        }, facture.numero_facture);
        
        console.log('✅ Transaction caisse créée automatiquement');
      } catch (transactionError) {
        console.error('❌ ERREUR CRITIQUE: Impossible de créer la transaction caisse:', transactionError);
        // Ne pas faire échouer la vente, mais alerter
      }
    }

    // 7. Créer versement si paiement
    if (venteData.montant_paye > 0) {
      console.log('💳 Création du versement...');
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
        console.log('✅ Versement créé');
      }
    }

    console.log('🎉 Vente comptoir créée avec succès:', facture.numero_facture);
    console.log('📦 Stock décrémenté:', venteData.point_vente_id ? 'OUI' : 'NON');
    console.log('📋 Statut livraison:', statutLivraisonId);
    
    return { facture, commande };

  } catch (error) {
    console.error('❌ Erreur création vente comptoir:', error);
    throw error;
  }
};
