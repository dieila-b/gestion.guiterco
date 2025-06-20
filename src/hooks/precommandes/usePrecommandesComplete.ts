
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
      return data as PrecommandeComplete[];
    }
  });
};
