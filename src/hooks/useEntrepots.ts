import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Entrepot {
  id: string;
  nom: string;
  adresse?: string;
  capacite_max?: number;
  gestionnaire?: string;
  statut: string;
  created_at: string;
  updated_at: string;
}

export const useEntrepots = () => {
  return useQuery({
    queryKey: ['entrepots-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrepots')
        .select('id, nom, statut')
        .eq('statut', 'actif')
        .order('nom');
      
      if (error) {
        console.error('Erreur lors du chargement des entrepôts:', error);
        throw error;
      }
      
      return data as Entrepot[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - données de configuration
    refetchOnWindowFocus: false
  });
};