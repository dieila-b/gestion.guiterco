
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { processDelivery } from './services/deliveryProcessingService';

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('🚀 Début création facture vente avec données:', data);
      console.log('🚀 Données de paiement reçues:', data.payment_data);

      // Déterminer le statut de livraison selon les données de paiement
      let statutLivraison = 'en_attente'; // Valeur par défaut
      
      if (data.payment_data && data.payment_data.statut_livraison) {
        console.log('📦 Statut livraison demandé:', data.payment_data.statut_livraison);
        
        // Mapper les différentes valeurs possibles vers le bon statut
        switch (data.payment_data.statut_livraison) {
          case 'livre':
          case 'livree':
          case 'complete':
            statutLivraison = 'livree';
            console.log('✅ Livraison complète - Statut défini: livree');
            break;
          case 'partiel':
          case 'partiellement_livree':
            statutLivraison = 'partiellement_livree';
            console.log('📦 Livraison partielle - Statut défini: partiellement_livree');
            break;
          default:
            statutLivraison = 'en_attente';
            console.log('⏳ Livraison en attente - Statut défini: en_attente');
        }
      }

      // Créer la facture principale avec le statut de livraison correct
      const factureData = {
        numero_facture: '', // Sera généré automatiquement par le trigger
        client_id: data.client_id,
        montant_ht: data.montant_ht,
        tva: data.tva,
        montant_ttc: data.montant_ttc,
        mode_paiement: data.mode_paiement,
        statut_paiement: 'en_attente',
        statut_livraison: statutLivraison // Utiliser le statut calculé
      };

      console.log('📝 Données facture à créer:', factureData);

      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert(factureData)
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('✅ Facture créée avec ID:', facture.id);
      console.log('✅ Statut livraison facture:', facture.statut_livraison);

      // Créer les lignes de facture avec les bons statuts
      const lignesFacture = data.cart.map((item: any) => {
        let quantiteLivree = 0;
        let statutLigneLivraison = 'en_attente';

        // Si livraison complète, marquer toutes les lignes comme livrées
        if (statutLivraison === 'livree') {
          quantiteLivree = item.quantite;
          statutLigneLivraison = 'livree';
        } else if (statutLivraison === 'partiellement_livree') {
          // Pour les livraisons partielles, utiliser les quantités spécifiées
          const quantiteSpecifiee = data.payment_data?.quantite_livree?.[item.article_id];
          if (quantiteSpecifiee && quantiteSpecifiee > 0) {
            quantiteLivree = Math.min(quantiteSpecifiee, item.quantite);
            statutLigneLivraison = quantiteLivree >= item.quantite ? 'livree' : 'partiellement_livree';
          }
        }

        return {
          facture_vente_id: facture.id,
          article_id: item.article_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          montant_ligne: item.quantite * item.prix_unitaire,
          quantite_livree: quantiteLivree,
          statut_livraison: statutLigneLivraison
        };
      });

      console.log('📝 Lignes facture à créer:', lignesFacture);

      const { data: lignesCreees, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .insert(lignesFacture)
        .select();

      if (lignesError) {
        console.error('❌ Erreur création lignes facture:', lignesError);
        throw lignesError;
      }

      console.log('✅ Lignes facture créées:', lignesCreees?.length);

      // Traiter la livraison si nécessaire (pour les cas complexes)
      if (data.payment_data && data.payment_data.statut_livraison === 'partiel') {
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
