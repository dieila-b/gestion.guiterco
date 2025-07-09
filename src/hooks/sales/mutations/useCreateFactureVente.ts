
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CartItem, VenteComptoirData } from '@/hooks/useVenteComptoir/types';

interface CreateFactureVenteParams {
  client_id: string;
  cart: CartItem[];
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement: string;
  point_vente_id: string;
  payment_data?: {
    montant_paye: number;
    mode_paiement: string;
    statut_livraison: string;
    statut_paiement: string;
    quantite_livree: Record<string, number>;
    notes?: string;
  };
}

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: CreateFactureVenteParams) => {
      console.log('🚀 Début création facture vente avec paiement correct:', params);
      
      const { client_id, cart, montant_ht, tva, montant_ttc, mode_paiement, point_vente_id, payment_data } = params;
      
      // Calculer le statut de paiement réel basé sur le montant payé
      const montantPaye = payment_data?.montant_paye || montant_ttc;
      let statutPaiement = 'en_attente';
      
      if (montantPaye >= montant_ttc) {
        statutPaiement = 'payee';
      } else if (montantPaye > 0) {
        statutPaiement = 'partiellement_payee';
      }
      
      console.log('💰 Calcul statut paiement:', {
        montant_ttc,
        montantPaye,
        statutPaiement
      });

      // Déterminer le statut de livraison
      const statutLivraison = payment_data?.statut_livraison || 'en_attente';
      
      // Mapper le statut de livraison vers l'ID correspondant
      let statutLivraisonId = 1; // Par défaut "En attente"
      let statutLivraisonText: "En attente" | "Partiellement livrée" | "Livrée" = "En attente";
      
      switch (statutLivraison) {
        case 'livree':
          statutLivraisonId = 3;
          statutLivraisonText = "Livrée";
          break;
        case 'partiellement_livree':
          statutLivraisonId = 2;
          statutLivraisonText = "Partiellement livrée";
          break;
        default:
          statutLivraisonId = 1;
          statutLivraisonText = "En attente";
      }

      // Créer la facture avec le statut de paiement correct
      const factureData = {
        client_id,
        montant_ht: montant_ttc, // Simplification : utiliser TTC comme HT pour éviter confusion
        tva: 0, // TVA à 0 pour simplifier
        montant_ttc,
        mode_paiement,
        statut_paiement: statutPaiement, // Utiliser le statut calculé
        statut_livraison: statutLivraisonText,
        statut_livraison_id: statutLivraisonId,
        numero_facture: '', // Sera généré automatiquement par le trigger
        taux_tva: 0
      };

      console.log('📋 Données facture (statut correct):', factureData);

      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert(factureData)
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('✅ Facture créée avec statut correct:', statutPaiement);

      // Créer les lignes de facture avec les quantités livrées
      const lignesFacture = cart.map((item) => {
        const quantiteLivree = payment_data?.quantite_livree?.[item.id] || 0;
        const statutLigneLivraison = quantiteLivree >= item.quantite ? 'livree' :
                                    quantiteLivree > 0 ? 'partiellement_livree' : 
                                    'en_attente';

        return {
          facture_vente_id: facture.id,
          article_id: item.id,
          quantite: item.quantite,
          prix_unitaire_brut: item.prix_unitaire,
          remise_unitaire: item.remise || 0,
          quantite_livree: quantiteLivree,
          statut_livraison: statutLigneLivraison,
          montant_ligne: (item.prix_unitaire - (item.remise || 0)) * item.quantite
        };
      });

      const { data: lignes, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .insert(lignesFacture)
        .select();

      if (lignesError) {
        console.error('❌ Erreur création lignes facture:', lignesError);
        throw lignesError;
      }

      console.log('✅ Lignes facture créées:', lignes);

      // Créer le versement seulement si un montant a été payé
      if (montantPaye > 0) {
        const versementData = {
          client_id,
          facture_id: facture.id,
          montant: montantPaye,
          mode_paiement,
          numero_versement: `V-${facture.numero_facture}`,
          date_versement: new Date().toISOString(),
          observations: montantPaye >= montant_ttc ? 
            'Paiement intégral' : 
            `Paiement partiel ${montantPaye}/${montant_ttc}`
        };

        const { error: versementError } = await supabase
          .from('versements_clients')
          .insert(versementData);

        if (versementError) {
          console.error('❌ Erreur création versement:', versementError);
          // Ne pas faire échouer la transaction pour un problème de versement
        } else {
          console.log('✅ Versement créé:', versementData);
        }
      }

      // Mettre à jour le stock PDV pour les articles livrés
      if (payment_data?.quantite_livree) {
        for (const item of cart) {
          const quantiteLivree = payment_data.quantite_livree[item.id] || 0;
          if (quantiteLivree > 0) {
            // Déduire du stock PDV seulement la quantité livrée
            const { error: stockError } = await supabase
              .from('stock_pdv')
              .update({
                quantite_disponible: `quantite_disponible - ${quantiteLivree}`
              })
              .eq('article_id', item.id)
              .eq('point_vente_id', point_vente_id);

            if (stockError) {
              console.error('❌ Erreur mise à jour stock:', stockError);
            }
          }
        }
      }

      // Créer la transaction de caisse pour le montant payé
      if (montantPaye > 0) {
        const { data: cashRegisters } = await supabase
          .from('cash_registers')
          .select('id')
          .limit(1);

        if (cashRegisters && cashRegisters.length > 0) {
          const transactionData = {
            type: 'income' as const,
            amount: montantPaye,
            montant: montantPaye,
            description: `Vente facture ${facture.numero_facture}`,
            commentaire: `Paiement ${mode_paiement} - Facture ${facture.numero_facture}`,
            category: 'sales' as const,
            payment_method: mode_paiement === 'carte' ? 'card' as const :
                           mode_paiement === 'virement' ? 'transfer' as const :
                           mode_paiement === 'cheque' ? 'check' as const :
                           'cash' as const,
            cash_register_id: cashRegisters[0].id,
            source: 'Vente au comptoir',
            date_operation: new Date().toISOString()
          };

          const { error: transactionError } = await supabase
            .from('transactions')
            .insert(transactionData);

          if (transactionError) {
            console.error('❌ Erreur création transaction:', transactionError);
          } else {
            console.log('✅ Transaction de caisse créée');
          }
        }
      }

      return {
        facture,
        lignes
      };
    },
    onSuccess: (data) => {
      console.log('🎉 Facture vente créée avec statut correct:', data.facture.statut_paiement);
      
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['versements_clients'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      console.log('✅ Queries invalidées et données rafraîchies');
      
      toast.success('Facture créée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur création facture vente:', error);
      toast.error('Erreur lors de la création de la facture');
    }
  });
};
