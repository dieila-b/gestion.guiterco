
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockItem {
  id: string;
  article_id: string;
  quantite_disponible: number;
  location_id: string;
  location_name: string;
  location_type: 'entrepot' | 'pdv';
  article_name: string;
  reference: string;
  prix_vente?: number;
  prix_achat?: number;
  derniere_entree?: string;
  derniere_livraison?: string;
}

export const useStockEntrepotSimple = () => {
  return useQuery({
    queryKey: ['stock-entrepot-simple'],
    queryFn: async () => {
      console.log('🔄 Chargement stock entrepôt simple...');
      
      const { data: stockData, error } = await supabase
        .from('stock_principal')
        .select('*')
        .gt('quantite_disponible', 0)
        .limit(100);

      if (error) {
        console.error('❌ Erreur stock principal:', error);
        throw error;
      }

      console.log('✅ Stock principal récupéré:', stockData?.length || 0, 'entrées');
      return stockData || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};

export const useStockPDVSimple = () => {
  return useQuery({
    queryKey: ['stock-pdv-simple'],
    queryFn: async () => {
      console.log('🔄 Chargement stock PDV simple...');
      
      const { data: stockData, error } = await supabase
        .from('stock_pdv')
        .select('*')
        .gt('quantite_disponible', 0)
        .limit(100);

      if (error) {
        console.error('❌ Erreur stock PDV:', error);
        throw error;
      }

      console.log('✅ Stock PDV récupéré:', stockData?.length || 0, 'entrées');
      return stockData || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};

export const useStockStats = () => {
  return useQuery({
    queryKey: ['stock-stats-simple'],
    queryFn: async () => {
      console.log('🔄 Chargement statistiques simples...');
      
      const [
        { count: countEntrepot },
        { count: countPDV }
      ] = await Promise.all([
        supabase.from('stock_principal').select('*', { count: 'exact', head: true }),
        supabase.from('stock_pdv').select('*', { count: 'exact', head: true })
      ]);

      const stats = {
        total_entrepot: countEntrepot || 0,
        total_pdv: countPDV || 0,
        total_global: (countEntrepot || 0) + (countPDV || 0)
      };

      console.log('✅ Stats récupérées:', stats);
      return stats;
    },
    staleTime: 60000
  });
};
