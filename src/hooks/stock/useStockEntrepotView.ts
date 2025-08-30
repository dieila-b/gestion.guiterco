
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockEntrepotView {
  id: string;
  article_id: string;
  entrepot_id: string;
  quantite_disponible: number;
  quantite_reservee: number;
  derniere_entree: string | null;
  article_nom: string;
  reference: string;
  prix_vente: number | null;
  prix_achat: number | null;
  prix_unitaire: number | null;
  entrepot_nom: string;
  entrepot_adresse: string | null;
  valeur_totale: number;
  categorie_nom: string | null;
  categorie_couleur: string | null;
  unite_nom: string | null;
  unite_symbole: string | null;
}

export const useStockEntrepotView = () => {
  return useQuery({
    queryKey: ['stock-entrepot-view'],
    queryFn: async () => {
      console.log('🏭 Récupération du stock entrepôt via la vue...');
      
      const { data, error } = await supabase
        .from('vue_stock_entrepot')
        .select('*')
        .order('entrepot_nom', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération du stock entrepôt:', error);
        throw error;
      }

      console.log('✅ Stock entrepôt récupéré:', data?.length, 'entrées');
      
      return data as StockEntrepotView[];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

export const useStockEntrepotStats = () => {
  return useQuery({
    queryKey: ['stock-entrepot-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_stock_entrepot_stats');
      
      if (error) {
        console.error('❌ Erreur lors de la récupération des stats entrepôt:', error);
        throw error;
      }
      
      return data?.[0] || { 
        total_articles: 0, 
        valeur_totale: 0, 
        entrepots_actifs: 0 
      };
    },
    staleTime: 2 * 60 * 1000
  });
};
