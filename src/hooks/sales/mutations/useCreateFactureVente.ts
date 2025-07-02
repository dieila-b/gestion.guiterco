
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { processDelivery } from './services/deliveryProcessingService';

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('🚀 Début création facture vente avec données:', data);

      // Créer la facture principale
      const factureData = {
        client_id: data.client_id,
        montant_ht: data.montant_ht,
        tva: data.tva,
        montant_ttc: data.montant_ttc,
        mode_paiement: data.mode_paiement,
        statut_paiement: 'en_attente',
        // Définir le statut de livraison selon les données de paiement
        statut_livraison: data.payment_data?.statut_livraison === 'livre' || 
                         data.payment_data?.statut_livraison === 'livree' ? 'livree' : 'en_attente'
      };

      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert(factureData)
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('✅ Facture créée avec ID:', facture.id, 'Statut livraison:', facture.statut_livraison);

      // Créer les lignes de facture
      const lignesFacture = data.cart.map((item: any) => ({
        facture_vente_id: facture.id,
        article_id: item.article_id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        montant_ligne: item.quantite * item.prix_unitaire,
        // Définir quantite_livree et statut_livraison selon le type de livraison
        quantite_livree: data.payment_data?.statut_livraison === 'livre' || 
                        data.payment_data?.statut_livraison === 'livree' ? item.quantite : 0,
        statut_livraison: data.payment_data?.statut_livraison === 'livre' || 
                         data.payment_data?.statut_livraison === 'livree' ? 'livree' : 'en_attente'
      }));

      const { data: lignesCreees, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .insert(lignesFacture)
        .select();

      if (lignesError) {
        console.error('❌ Erreur création lignes facture:', lignesError);
        throw lignesError;
      }

      console.log('✅ Lignes facture créées:', lignesCreees?.length);

      // Traiter la livraison si nécessaire
      if (data.payment_data) {
        await processDelivery(data.payment_data, facture, lignesCreees);
      }

      // Créer le versement si paiement immédiat
      if (data.payment_data?.montant_paye > 0) {
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

      console.log('🎉 Facture vente créée avec succès - Statut final:', {
        paiement: facture.statut_paiement,
        livraison: facture.statut_livraison
      });

      return { facture, lignes: lignesCreees };
    },
    onSuccess: () => {
      // Invalider toutes les queries liées aux factures pour forcer le rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['factures-vente-details'] });
      
      // Force le refetch immédiat
      queryClient.refetchQueries({ queryKey: ['factures_vente'] });
      
      console.log('✅ Queries invalidées et données rafraîchies');
      
      toast.success('Facture créée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur création facture vente:', error);
      toast.error('Erreur lors de la création de la facture');
    }
  });
};
