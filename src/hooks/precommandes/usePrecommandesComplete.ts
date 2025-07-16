
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PrecommandeComplete } from '@/types/precommandes';

export const usePrecommandesComplete = () => {
  return useQuery({
    queryKey: ['precommandes-complete'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('precommandes')
        .select(`
          *,
          client:clients(*),
          lignes_precommande(
            *,
            article:catalogue(*)
          ),
          notifications:notifications_precommandes(*),
          bon_livraison:bons_de_livraison(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Enrichir les données avec les informations de stock
      const enrichedData = await Promise.all(
        (data || []).map(async (precommande) => {
          const lignesEnrichies = await Promise.all(
            (precommande.lignes_precommande || []).map(async (ligne) => {
              // Calculer le stock disponible pour cet article
              const { data: stockData } = await supabase.rpc('get_total_stock_available', {
                p_article_id: ligne.article_id
              });
              
              return {
                ...ligne,
                stock_disponible: {
                  entrepot: 0, // Sera calculé côté serveur
                  pdv: 0, // Sera calculé côté serveur
                  total: stockData || 0
                }
              };
            })
          );
          
          return {
            ...precommande,
            lignes_precommande: lignesEnrichies
          };
        })
      );
      
      return enrichedData as PrecommandeComplete[];
    }
  });
};
