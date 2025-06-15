
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPointDeVente } from '@/components/stock/types';

export const useStockPDV = () => {
  const { data: stockPDV, isLoading, error, refetch } = useQuery({
    queryKey: ['stock-pdv'],
    queryFn: async () => {
      console.log('🔄 Récupération du stock PDV...');
      
      const { data, error } = await supabase
        .from('stock_pdv')
        .select(`
          *,
          article:article_id(*),
          point_vente:point_vente_id(*)
        `)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur récupération stock PDV:', error);
        throw error;
      }
      
      console.log('✅ Stock PDV récupéré:', data?.length, 'éléments');
      return data as StockPointDeVente[];
    },
    // Rafraîchir plus fréquemment pour voir les changements
    staleTime: 10000, // 10 secondes
    refetchOnWindowFocus: true,
    refetchInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  return {
    stockPDV,
    isLoading,
    error,
    refetch
  };
};
