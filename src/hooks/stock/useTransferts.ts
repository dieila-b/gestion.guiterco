
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Transfert } from '@/components/stock/types';

export const useTransferts = () => {
  const queryClient = useQueryClient();
  
  const { data: transferts, isLoading, error } = useQuery({
    queryKey: ['transferts'],
    queryFn: async () => {
      console.log('🔄 Chargement des transferts...');
      
      const { data, error } = await supabase
        .from('transferts')
        .select(`
          *,
          article:catalogue!transferts_article_id_fkey(*),
          entrepot_source:entrepots!transferts_entrepot_source_id_fkey(*),
          entrepot_destination:entrepots!transferts_entrepot_destination_id_fkey(*),
          pdv_destination:points_de_vente!transferts_pdv_destination_id_fkey(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur lors du chargement des transferts:', error);
        throw error;
      }
      
      console.log('✅ Transferts chargés:', data?.length || 0);
      return data as Transfert[];
    }
  });

  const createTransfert = useMutation({
    mutationFn: async (newTransfert: Omit<Transfert, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transferts')
        .insert(newTransfert)
        .select(`
          *,
          article:catalogue!transferts_article_id_fkey(*),
          entrepot_source:entrepots!transferts_entrepot_source_id_fkey(*),
          entrepot_destination:entrepots!transferts_entrepot_destination_id_fkey(*),
          pdv_destination:points_de_vente!transferts_pdv_destination_id_fkey(*)
        `)
        .single();
      
      if (error) throw error;
      return data as Transfert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferts'] });
      queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      toast({
        title: "Transfert créé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la création du transfert:', error);
      toast({
        title: "Erreur lors de la création du transfert",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    transferts,
    isLoading,
    error,
    createTransfert
  };
};
