
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EntreeStock } from '@/components/stock/types';

export const useEntreesStock = () => {
  const queryClient = useQueryClient();
  
  const { data: entrees, isLoading, error } = useQuery({
    queryKey: ['entrees-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrees_stock')
        .select(`
          *,
          article:article_id(*),
          entrepot:entrepot_id(*),
          point_vente:point_vente_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data as EntreeStock[];
    }
  });

  const createEntree = useMutation({
    mutationFn: async (newEntree: Omit<EntreeStock, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('entrees_stock')
        .insert(newEntree)
        .select()
        .single();
      
      if (error) throw error;
      return data as EntreeStock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrees-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      toast({
        title: "Entrée de stock créée avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création de l'entrée de stock",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    entrees,
    isLoading,
    error,
    createEntree
  };
};
