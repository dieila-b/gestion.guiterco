
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { processDelivery } from './services/deliveryProcessingService';
import { updateStockPDV } from './services/stockUpdateService';

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('🚀 Début création facture vente avec données:', data);

      // Créer la facture principale (la remise_totale sera calculée automatiquement par le trigger)
      const factureData = {
        client_id: data.client_id,
        montant_ht: data.montant_ht,
        tva: data.tva,
        montant_ttc: data.montant_ttc,
        mode_paiement: data.mode_paiement,
        statut_paiement: 'en_attente',
        statut_livraison: 'En attente' as const,
        statut_livraison_id: 1,
        numero_facture: ''
      };

      console.log('📋 Données facture:', factureData);

      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert(factureData)
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('✅ Facture créée:', facture.id);

      // Créer les lignes de facture avec toutes les données de remise
      const lignesFacture = data.cart.map((item: any) => {
        const prixUnitaireBrut = item.prix_vente || item.prix_unitaire || 0;
        const remiseUnitaire = item.remise || 0;
        const remisePourcentage = item.remise_pourcentage || 0;
        const prixUnitaireNet = prixUnitaireBrut - remiseUnitaire;
        const montantLigne = item.quantite * prixUnitaireNet;

        console.log('📦 Ligne facture avec remise:', {
          article_id: item.article_id,
          quantite: item.quantite,
          prix_unitaire_brut: prixUnitaireBrut,
          remise_unitaire: remiseUnitaire,
          remise_pourcentage: remisePourcentage,
          prix_unitaire_net: prixUnitaireNet,
          montant_ligne: montantLigne
        });

        return {
          facture_vente_id: facture.id,
          article_id: item.article_id,
          quantite: item.quantite,
          prix_unitaire: prixUnitaireNet, // Prix après remise
          prix_unitaire_brut: prixUnitaireBrut, // Prix avant remise
          remise_unitaire: remiseUnitaire, // Montant de la remise par unité
          remise_pourcentage: remisePourcentage, // Pourcentage de remise
          montant_ligne: montantLigne, // Montant total de la ligne après remise
          quantite_livree: 0,
          statut_livraison: 'en_attente'
        };
      });

      const { data: lignesCreees, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .insert(lignesFacture)
        .select();

      if (lignesError) {
        console.error('❌ Erreur création lignes facture:', lignesError);
        throw lignesError;
      }

      console.log('✅ Lignes facture créées avec remises:', lignesCreees?.map(l => ({
        id: l.id,
        prix_unitaire_brut: l.prix_unitaire_brut,
        remise_unitaire: l.remise_unitaire,
        prix_unitaire: l.prix_unitaire,
        montant_ligne: l.montant_ligne
      })));

      // IMPORTANT: Traiter la livraison SEULEMENT si des données de livraison sont fournies
      if (data.payment_data && data.payment_data.statut_livraison) {
        console.log('📦 Traitement livraison avec statut:', data.payment_data.statut_livraison);
        await processDelivery(data.payment_data, facture, lignesCreees);
      }

      // IMPORTANT: Mettre à jour le stock PDV si un point de vente est spécifié
      if (data.point_vente_id) {
        try {
          await updateStockPDV(data, facture);
          console.log('✅ Stock PDV mis à jour avec succès');
        } catch (stockError) {
          console.error('❌ Erreur mise à jour stock PDV:', stockError);
          toast.error('Vente créée mais stock non mis à jour : ' + stockError.message);
        }
      }

      // IMPORTANT: Créer la transaction de caisse SI paiement effectué
      if (data.payment_data?.montant_paye > 0) {
        try {
          await createCashTransaction(data.payment_data.montant_paye, facture.numero_facture, data.mode_paiement);
          console.log('✅ Transaction de caisse créée avec succès');
        } catch (cashError) {
          console.error('❌ Erreur création transaction caisse:', cashError);
          toast.error('Vente créée mais transaction de caisse non enregistrée');
        }

        // Créer le versement client
        const versementData = {
          client_id: data.client_id,
          facture_id: facture.id,
          montant: data.payment_data.montant_paye,
          mode_paiement: data.mode_paiement,
          numero_versement: `VERS-${facture.numero_facture}`,
          date_versement: new Date().toISOString(),
        };

        const { error: versementError } = await supabase
          .from('versements_clients')
          .insert(versementData);

        if (versementError) {
          console.error('❌ Erreur création versement:', versementError);
          throw versementError;
        }

        // Mettre à jour le statut de paiement
        const nouveauStatutPaiement = data.payment_data.montant_paye >= data.montant_ttc ? 'payee' : 'partiellement_payee';
        
        await supabase
          .from('factures_vente')
          .update({ statut_paiement: nouveauStatutPaiement })
          .eq('id', facture.id);

        console.log('✅ Versement créé et statut paiement mis à jour:', nouveauStatutPaiement);
      }

      // Récupérer la facture mise à jour avec la remise_totale calculée par le trigger
      const { data: factureFinale } = await supabase
        .from('factures_vente')
        .select('*')
        .eq('id', facture.id)
        .single();

      console.log('🎉 Facture vente créée avec succès - Remise totale:', factureFinale?.remise_totale);

      return { facture: factureFinale || facture, lignes: lignesCreees };
    },
    onSuccess: () => {
      // Invalider toutes les queries liées aux factures pour forcer le rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['factures-vente-details'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
      
      // Force le refetch immédiat
      queryClient.refetchQueries({ queryKey: ['factures_vente'] });
      
      console.log('✅ Queries invalidées et données rafraîchies');
      
      toast.success('Vente finalisée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur création facture vente:', error);
      toast.error('Erreur lors de la création de la facture');
    }
  });
};

// Fonction pour créer une transaction de caisse
async function createCashTransaction(montant: number, numeroFacture: string, modePaiement: string) {
  console.log('💰 Création transaction de caisse:', { montant, numeroFacture, modePaiement });
  
  // Récupérer la première caisse disponible
  const { data: cashRegister, error: cashRegisterError } = await supabase
    .from('cash_registers')
    .select('id')
    .limit(1)
    .single();

  if (cashRegisterError) {
    console.error('❌ Erreur récupération caisse:', cashRegisterError);
    throw new Error('Aucune caisse disponible');
  }

  // Mapper le mode de paiement
  let paymentMethod: 'cash' | 'card' | 'transfer' | 'check' = 'cash';
  
  switch(modePaiement) {
    case 'carte':
      paymentMethod = 'card';
      break;
    case 'virement':
      paymentMethod = 'transfer';
      break;
    case 'cheque':
      paymentMethod = 'check';
      break;
    case 'especes':
    default:
      paymentMethod = 'cash';
      break;
  }

  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      type: 'income',
      amount: montant,
      montant: montant,
      description: `Vente ${numeroFacture}`,
      commentaire: `Paiement vente ${numeroFacture}`,
      category: 'sales',
      payment_method: paymentMethod,
      cash_register_id: cashRegister.id,
      date_operation: new Date().toISOString(),
      source: 'vente'
    });

  if (transactionError) {
    console.error('❌ Erreur création transaction:', transactionError);
    throw transactionError;
  }

  console.log('✅ Transaction de caisse créée avec succès');
}
