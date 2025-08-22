
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Transfert } from '@/components/stock/types';

export const useTransferts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transferts = [], isLoading, error } = useQuery({
    queryKey: ['transferts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transferts')
        .select(`
          *,
          article:catalogue!transferts_article_id_fkey(
            id, reference, nom, prix_vente, prix_achat, prix_unitaire, 
            statut, categorie, unite_mesure
          ),
          entrepot_source:entrepots!transferts_entrepot_source_id_fkey(id, nom, statut),
          entrepot_destination:entrepots!transferts_entrepot_destination_id_fkey(id, nom, statut),
          pdv_destination:points_de_vente!transferts_pdv_destination_id_fkey(id, nom, statut)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transfert[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createTransfert = useMutation({
    mutationFn: async (transfert: Omit<Transfert, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transferts')
        .insert([transfert])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferts'] });
      queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
      toast({
        title: "Succès",
        description: "Transfert créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du transfert",
        variant: "destructive",
      });
    }
  });

  const updateTransfert = useMutation({
    mutationFn: async (data: { id: string; statut: string }) => {
      const { data: result, error } = await supabase
        .from('transferts')
        .update({ statut: data.statut })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferts'] });
      queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
      toast({
        title: "Succès",
        description: "Transfert mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du transfert",
        variant: "destructive",
      });
    }
  });

  return {
    transferts,
    isLoading,
    error: error as Error,
    createTransfert,
    updateTransfert
  };
};
