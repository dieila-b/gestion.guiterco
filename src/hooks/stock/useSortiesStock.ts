
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SortieStock } from '@/components/stock/types';

export const useSortiesStock = () => {
  const queryClient = useQueryClient();
  
  const { data: sorties, isLoading, error } = useQuery({
    queryKey: ['sorties-stock'],
    queryFn: async () => {
      console.log('🔄 Chargement des sorties de stock...');
      
      const { data, error } = await supabase
        .from('sorties_stock')
        .select(`
          *,
          article:catalogue!sorties_stock_article_id_fkey(*),
          entrepot:entrepots!sorties_stock_entrepot_id_fkey(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur lors du chargement des sorties de stock:', error);
        throw error;
      }
      
      console.log('✅ Sorties de stock chargées:', data?.length || 0);
      return data as SortieStock[];
    }
  });

  const createSortie = useMutation({
    mutationFn: async (newSortie: Omit<SortieStock, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('sorties_stock')
        .insert(newSortie)
        .select(`
          *,
          article:catalogue!sorties_stock_article_id_fkey(*),
          entrepot:entrepots!sorties_stock_entrepot_id_fkey(*)
        `)
        .single();
      
      if (error) throw error;
      return data as SortieStock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sorties-stock'] });
      queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      toast({
        title: "Sortie de stock créée avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la création de la sortie:', error);
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
