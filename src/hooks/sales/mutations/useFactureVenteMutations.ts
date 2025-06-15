
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CartItem } from '@/hooks/useVenteComptoir/types';

interface CreateFactureVenteData {
  client_id: string;
  cart: CartItem[];
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement?: string;
  point_vente_id?: string;
}

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFactureVenteData) => {
      console.log('🔄 Création facture vente avec données:', data);
      
      // 1. Créer la facture
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert({
          client_id: data.client_id,
          date_facture: new Date().toISOString(),
          montant_ht: data.montant_ht,
          tva: data.tva,
          montant_ttc: data.montant_ttc,
          mode_paiement: data.mode_paiement,
          statut_paiement: 'payee', // Vente comptoir = directement payée
          statut_livraison: 'livree' // Vente comptoir = directement livrée
        })
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('✅ Facture créée:', facture);

      // 2. Créer les lignes de facture pour chaque article du panier
      const lignesFacture = data.cart.map(item => ({
        facture_vente_id: facture.id,
        article_id: item.article_id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        montant_ligne: item.quantite * item.prix_unitaire,
        statut_livraison: 'livree' // Vente comptoir = directement livrée
      }));

      console.log('🔄 Création lignes facture:', lignesFacture);

      const { data: lignesCreees, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .insert(lignesFacture)
        .select();

      if (lignesError) {
        console.error('❌ Erreur création lignes facture:', lignesError);
        throw lignesError;
      }

      console.log('✅ Lignes facture créées:', lignesCreees);

      // 3. Créer le versement si un mode de paiement est spécifié
      if (data.mode_paiement) {
        const { error: versementError } = await supabase
          .from('versements_clients')
          .insert({
            client_id: data.client_id,
            facture_id: facture.id,
            montant: data.montant_ttc,
            mode_paiement: data.mode_paiement,
            date_versement: new Date().toISOString(),
            numero_versement: `V-${facture.numero_facture}`
          });

        if (versementError) {
          console.error('❌ Erreur création versement:', versementError);
          throw versementError;
        }

        console.log('✅ Versement créé pour facture:', facture.numero_facture);
      }

      // 4. Mettre à jour le stock PDV si spécifié
      if (data.point_vente_id) {
        for (const item of data.cart) {
          const { error: stockError } = await supabase
            .from('stock_pdv')
            .update({
              quantite_disponible: supabase.raw(`quantite_disponible - ${item.quantite}`)
            })
            .eq('article_id', item.article_id)
            .eq('point_vente_id', data.point_vente_id);

          if (stockError) {
            console.error('❌ Erreur mise à jour stock PDV:', stockError);
            // Ne pas faire échouer la transaction pour un problème de stock
          }
        }
        console.log('✅ Stock PDV mis à jour');
      }

      return { facture, lignes: lignesCreees };
    },
    onSuccess: () => {
      console.log('✅ Facture de vente créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      toast.success('Facture créée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création de la facture:', error);
      toast.error('Erreur lors de la création de la facture');
    }
  });
};
