
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LivraisonStatut {
  id: number;
  nom: string;
}

export const useLivraisonStatut = () => {
  return useQuery({
    queryKey: ['livraison-statut'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('livraison_statut')
        .select('*')
        .order('id');

      if (error) throw error;
      return data as LivraisonStatut[];
    }
  });
};
