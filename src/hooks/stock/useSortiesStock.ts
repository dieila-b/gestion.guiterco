
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SortieStock } from '@/components/stock/types';

export const useSortiesStock = () => {
  const queryClient = useQueryClient();
  
  const { data: sorties, isLoading, error } = useQuery({
    queryKey: ['sorties-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sorties_stock')
        .select(`
          *,
          article:article_id(*),
          entrepot:entrepot_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data as SortieStock[];
    }
  });

  const createSortie = useMutation({
    mutationFn: async (newSortie: Omit<SortieStock, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('sorties_stock')
        .insert(newSortie)
        .select()
        .single();
      
      if (error) throw error;
      return data as SortieStock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sorties-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      toast({
        title: "Sortie de stock créée avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création de la sortie de stock",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    sorties,
    isLoading,
    error,
    createSortie
  };
};
