
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { VenteComptoirData } from './types';

export const useVenteComptoirMutations = () => {
  const queryClient = useQueryClient();

  const createSale = useMutation({
    mutationFn: async (saleData: VenteComptoirData) => {
      console.log('🛒 Création vente comptoir:', saleData);
      
      // Créer la facture de vente
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert({
          client_id: saleData.client_id,
          montant_ht: saleData.montant_ht,
          tva: saleData.tva,
          montant_ttc: saleData.montant_ttc,
          mode_paiement: saleData.mode_paiement,
          statut_paiement: 'payee',
          statut_livraison_id: 3, // Livrée
          taux_tva: 20.00
        })
        .select()
        .single();

      if (factureError) throw factureError;

      // Créer les lignes de facture
      const lignesFacture = saleData.cart.map(item => ({
        facture_vente_id: facture.id,
        article_id: item.article_id || item.id,
        quantite: item.quantite,
        prix_unitaire_brut: item.prix_final || item.prix_unitaire,
        remise_unitaire: item.remise_unitaire || 0,
        montant_ligne: (item.prix_final || item.prix_unitaire) * item.quantite,
        quantite_livree: item.quantite,
        statut_livraison: 'livree'
      }));

      const { error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .insert(lignesFacture);

      if (lignesError) throw lignesError;

      // Créer le paiement
      if (saleData.payment_data) {
        const { error: paiementError } = await supabase
          .from('paiements_vente')
          .insert({
            facture_vente_id: facture.id,
            montant: saleData.payment_data.montant_paye,
            moyen_paiement: saleData.payment_data.mode_paiement,
            date_paiement: new Date().toISOString()
          });

        if (paiementError) throw paiementError;
      }

      return facture;
    },
    onSuccess: (facture) => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['factures-vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      
      toast.success(`Vente créée avec succès - Facture ${facture.numero_facture}`);
    },
    onError: (error: any) => {
      console.error('❌ Erreur vente comptoir:', error);
      toast.error(`Erreur lors de la vente: ${error.message}`);
    }
  });

  return {
    createSale
  };
};
