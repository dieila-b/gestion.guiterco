
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PrecommandeAlert {
  article_nom: string;
  total_en_precommande: number;
  total_deja_livre: number;
  reste_a_livrer: number;
  nb_precommandes: number;
}

export const usePrecommandeAlerts = (articleId?: string) => {
  return useQuery({
    queryKey: ['precommande-alerts', articleId],
    queryFn: async () => {
      if (!articleId) return null;
      
      const { data, error } = await supabase.rpc('get_precommandes_info_for_article', {
        p_article_id: articleId
      });
      
      if (error) throw error;
      return data?.[0] as PrecommandeAlert || null;
    },
    enabled: !!articleId
  });
};
