
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CreateFactureVenteData } from './types';

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFactureVenteData & { payment_data?: any }) => {
      console.log('🔄 Création facture vente avec données:', data);
      
      // 1. Créer la facture TOUJOURS avec des statuts initiaux en_attente
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert({
          numero_facture: 'TEMP', // Sera remplacé par le trigger
          client_id: data.client_id,
          date_facture: new Date().toISOString(),
          montant_ht: data.montant_ht,
          tva: data.tva,
          montant_ttc: data.montant_ttc,
          mode_paiement: data.mode_paiement,
          statut_paiement: 'en_attente', // TOUJOURS en attente au début
          statut_livraison: 'en_attente' // TOUJOURS en attente au début
        })
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('✅ Facture créée avec statuts en_attente:', facture);

      // 2. Créer les lignes de facture TOUJOURS avec statut en_attente initialement
      const lignesFacture = data.cart.map(item => ({
        facture_vente_id: facture.id,
        article_id: item.article_id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        montant_ligne: item.quantite * item.prix_unitaire,
        statut_livraison: 'en_attente' // TOUJOURS en_attente au début
      }));

      console.log('🔄 Création lignes facture avec statut en_attente:', lignesFacture);

      const { data: lignesCreees, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .insert(lignesFacture)
        .select();

      if (lignesError) {
        console.error('❌ Erreur création lignes facture:', lignesError);
        throw lignesError;
      }

      console.log('✅ Lignes facture créées avec statut en_attente:', lignesCreees);

      // 3. Traiter le paiement SEULEMENT s'il y en a un
      if (data.payment_data && data.payment_data.montant_paye > 0) {
        console.log('💰 Traitement paiement pour montant:', data.payment_data.montant_paye);
        
        // Créer le versement
        const { error: versementError } = await supabase
          .from('versements_clients')
          .insert({
            facture_id: facture.id,
            client_id: facture.client_id,
            montant: data.payment_data.montant_paye,
            mode_paiement: data.payment_data.mode_paiement,
            date_versement: new Date().toISOString(),
            numero_versement: `VERS-${facture.numero_facture}-001`,
            observations: data.payment_data.notes || null
          });

        if (versementError) {
          console.error('❌ Erreur création versement:', versementError);
          throw versementError;
        }

        console.log('✅ Versement créé pour montant:', data.payment_data.montant_paye);

        // Mettre à jour le statut de paiement selon le montant
        let nouveauStatutPaiement = 'en_attente';
        if (data.payment_data.montant_paye >= facture.montant_ttc) {
          nouveauStatutPaiement = 'payee';
        } else if (data.payment_data.montant_paye > 0) {
          nouveauStatutPaiement = 'partiellement_payee';
        }

        await supabase
          .from('factures_vente')
          .update({ statut_paiement: nouveauStatutPaiement })
          .eq('id', facture.id);

        console.log('✅ Statut paiement mis à jour:', nouveauStatutPaiement);
      } else {
        console.log('⚠️ Aucun paiement - facture reste en_attente');
      }

      // 4. Traiter la livraison SEULEMENT si confirmée
      if (data.payment_data && data.payment_data.statut_livraison !== 'en_attente') {
        console.log('📦 Traitement livraison:', data.payment_data.statut_livraison);
        
        if (data.payment_data.statut_livraison === 'livre') {
          // Marquer toutes les lignes comme livrées
          await supabase
            .from('lignes_facture_vente')
            .update({ statut_livraison: 'livree' })
            .eq('facture_vente_id', facture.id);

          await supabase
            .from('factures_vente')
            .update({ statut_livraison: 'livree' })
            .eq('id', facture.id);

          console.log('✅ Toutes les lignes marquées comme livrées');
        } else if (data.payment_data.statut_livraison === 'partiel') {
          // Traitement livraison partielle
          for (const [itemId, quantiteLivree] of Object.entries(data.payment_data.quantite_livree || {})) {
            const ligne = lignesCreees?.find(l => l.article_id === itemId);
            if (ligne && quantiteLivree > 0) {
              await supabase
                .from('lignes_facture_vente')
                .update({ statut_livraison: quantiteLivree >= ligne.quantite ? 'livree' : 'partiellement_livree' })
                .eq('id', ligne.id);
            }
          }

          await supabase
            .from('factures_vente')
            .update({ statut_livraison: 'partiellement_livree' })
            .eq('id', facture.id);

          console.log('✅ Livraison partielle traitée');
        }
      } else {
        console.log('⚠️ Aucune livraison confirmée - facture reste en_attente');
      }

      // 5. Mettre à jour le stock PDV seulement si spécifié
      if (data.point_vente_id) {
        await updateStockPDV(data, facture);
      }

      return { facture, lignes: lignesCreees };
    },
    onSuccess: () => {
      console.log('✅ Facture de vente créée avec statuts corrects');
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash_registers'] });
      toast.success('Facture créée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création de la facture:', error);
      toast.error('Erreur lors de la création de la facture');
    }
  });
};

// Helper function to update stock PDV
async function updateStockPDV(data: CreateFactureVenteData, facture: any) {
  let pointVenteId = data.point_vente_id!;
  
  console.log('📦 Début mise à jour stock PDV pour:', pointVenteId);
  
  // Vérifier si c'est déjà un UUID valide
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(data.point_vente_id!)) {
    console.log('🔍 Recherche ID du point de vente pour nom:', data.point_vente_id);
    
    const { data: pdvData, error: pdvError } = await supabase
      .from('points_de_vente')
      .select('id')
      .eq('nom', data.point_vente_id)
      .single();
    
    if (pdvError) {
      console.error('❌ Erreur récupération point de vente:', pdvError);
      return;
    } else {
      pointVenteId = pdvData.id;
      console.log('✅ ID point de vente trouvé:', pointVenteId);
    }
  }

  // Mettre à jour le stock pour chaque article
  for (const item of data.cart) {
    console.log(`🔄 Mise à jour stock pour article ${item.article_id}, quantité à déduire: ${item.quantite}`);
    
    // Vérifier le stock actuel
    const { data: stockExistant, error: stockCheckError } = await supabase
      .from('stock_pdv')
      .select('id, quantite_disponible')
      .eq('article_id', item.article_id)
      .eq('point_vente_id', pointVenteId)
      .maybeSingle();

    if (stockCheckError) {
      console.error('❌ Erreur vérification stock:', stockCheckError);
      continue;
    }

    if (stockExistant) {
      const nouvelleQuantite = Math.max(0, stockExistant.quantite_disponible - item.quantite);
      console.log(`📦 Stock avant: ${stockExistant.quantite_disponible}, après vente: ${nouvelleQuantite}`);

      const { error: updateError } = await supabase
        .from('stock_pdv')
        .update({
          quantite_disponible: nouvelleQuantite,
          updated_at: new Date().toISOString()
        })
        .eq('id', stockExistant.id);

      if (updateError) {
        console.error('❌ ERREUR CRITIQUE - Échec mise à jour stock:', updateError);
        throw new Error(`Impossible de mettre à jour le stock pour l'article ${item.article_id}`);
      } else {
        console.log(`✅ Stock mis à jour avec succès pour article ${item.article_id}: ${stockExistant.quantite_disponible} → ${nouvelleQuantite}`);
      }
    } else {
      console.log(`⚠️ ATTENTION - Aucun stock trouvé pour l'article ${item.article_id} au PDV ${pointVenteId}`);
      throw new Error(`Stock non trouvé pour l'article ${item.article_id} au point de vente`);
    }
  }
  
  console.log('✅ Mise à jour stock PDV terminée avec succès');
}
