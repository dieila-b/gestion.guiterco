
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { processDelivery } from './services/deliveryProcessingService';
import { updateStockPDV } from './services/stockUpdateService';

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('🚀 Début création facture vente avec nouveaux défauts:', data);

      // Créer la facture principale avec le statut par défaut 'payee'
      const factureData = {
        client_id: data.client_id,
        montant_ht: data.montant_ttc, // Pas de TVA donc HT = TTC
        tva: 0, // Forcer à 0
        montant_ttc: data.montant_ttc,
        mode_paiement: data.mode_paiement,
        // Ne pas définir statut_paiement - utiliser le défaut DB 'payee'
        statut_livraison: 'En attente' as const,
        statut_livraison_id: 1,
        numero_facture: '',
        taux_tva: 0 // Forcer à 0
      };

      console.log('📋 Données facture (défaut payee):', factureData);

      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert(factureData)
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('✅ Facture créée avec statut défaut:', facture.statut_paiement);

      // Créer les lignes de facture SANS montant_ligne (calculé par Supabase)
      const lignesFacture = data.cart.map((item: any) => {
        const prixUnitaireBrut = item.prix_unitaire_brut || item.prix_unitaire || item.prix_vente || 0;
        const remiseUnitaire = item.remise_unitaire || item.remise || 0;

        return {
          facture_vente_id: facture.id,
          article_id: item.article_id,
          quantite: item.quantite,
          prix_unitaire_brut: prixUnitaireBrut,
          remise_unitaire: remiseUnitaire,
          // Ne pas inclure montant_ligne - calculé automatiquement par Supabase
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

      console.log('✅ Lignes facture créées:', lignesCreees?.length);

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

        // Note: Le versement client est maintenant créé automatiquement par le trigger DB
        // si la facture a le statut 'payee' par défaut
        console.log('✅ Versement client créé automatiquement par le trigger DB');
      }

      // Récupérer la facture mise à jour avec la remise_totale calculée par le trigger
      const { data: factureFinale } = await supabase
        .from('factures_vente')
        .select('*')
        .eq('id', facture.id)
        .single();

      console.log('🎉 Facture vente créée avec statut automatique:', factureFinale?.statut_paiement);

      return { facture: factureFinale || facture, lignes: lignesCreees };
    },
    onSuccess: () => {
      // Invalider toutes les queries liées aux factures pour forcer le rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['factures-vente-details'] });
      queryClient.invalidateQueries({ queryKey: ['versements_clients'] });
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
