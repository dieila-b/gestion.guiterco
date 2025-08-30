
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockPDVView {
  id: string;
  article_id: string;
  point_vente_id: string;
  quantite_disponible: number;
  quantite_minimum: number | null;
  derniere_livraison: string | null;
  article_nom: string;
  reference: string;
  prix_vente: number | null;
  prix_achat: number | null;
  prix_unitaire: number | null;
  pdv_nom: string;
  type_pdv: string | null;
  pdv_adresse: string | null;
  valeur_totale: number;
  categorie_nom: string | null;
  categorie_couleur: string | null;
  unite_nom: string | null;
  unite_symbole: string | null;
}

export const useStockPDVView = () => {
  return useQuery({
    queryKey: ['stock-pdv-view'],
    queryFn: async () => {
      console.log('🏪 Récupération du stock PDV via vue...');
      
      const { data, error } = await supabase
        .from('vue_stock_pdv')
        .select('*')
        .order('pdv_nom', { ascending: true })
        .order('article_nom', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération du stock PDV:', error);
        throw error;
      }

      console.log('✅ Stock PDV récupéré:', data?.length, 'entrées');
      return data as StockPDVView[];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

export const useStockPDVStats = () => {
  return useQuery({
    queryKey: ['stock-pdv-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_stock_pdv_stats');
      
      if (error) {
        console.error('❌ Erreur lors de la récupération des stats PDV:', error);
        throw error;
      }
      
      return data?.[0] || { total_articles: 0, valeur_totale: 0, pdv_actifs: 0 };
    },
    staleTime: 2 * 60 * 1000
  });
};
