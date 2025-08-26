import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { BonLivraison } from '@/types/purchases';

export const useBonsLivraison = () => {
  const queryClient = useQueryClient();
  
  const { data: bonsLivraison, isLoading, error } = useQuery({
    queryKey: ['bons-livraison'],
    queryFn: async () => {
      console.log('Fetching bons de livraison...');
      const { data, error } = await supabase
        .from('bons_de_livraison')
        .select(`
          *,
          bon_commande:bons_de_commande!bon_commande_id(
            id,
            numero_bon,
            fournisseur,
            fournisseur_id,
            date_commande,
            date_livraison_prevue,
            statut,
            statut_paiement,
            montant_total,
            tva,
            montant_ht,
            remise,
            frais_livraison,
            frais_logistique,
            transit_douane,
            taux_tva,
            montant_paye,
            observations,
            created_at,
            updated_at,
            created_by
          ),
          entrepot_destination:entrepots!entrepot_destination_id(*),
          point_vente_destination:points_de_vente!point_vente_destination_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bons de livraison:', error);
        throw error;
      }
      
      console.log('Fetched bons de livraison with relations:', data);
      return data as unknown as BonLivraison[];
    }
  });

  const createBonLivraison = useMutation({
    mutationFn: async (newBon: Omit<BonLivraison, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating bon de livraison:', newBon);
      const { data, error } = await supabase
        .from('bons_de_livraison')
        .insert(newBon)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating bon de livraison:', error);
        throw error;
      }
      
      console.log('Bon de livraison created:', data);
      return data as BonLivraison;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-livraison-articles-counts'] });
      toast({
        title: "Bon de livraison créé avec succès",
        variant: "default",
      });
    }
  });

  const updateBonLivraison = useMutation({
    mutationFn: async ({ id, ...bon }: Partial<BonLivraison> & { id: string }) => {
      const { data, error } = await supabase
        .from('bons_de_livraison')
        .update(bon)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BonLivraison;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-livraison-articles-counts'] });
      toast({
        title: "Bon de livraison mis à jour avec succès",
        variant: "default",
      });
    }
  });

  return {
    bonsLivraison,
    isLoading,
    error,
    createBonLivraison,
    updateBonLivraison
  };
};
