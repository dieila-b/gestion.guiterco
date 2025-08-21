import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PointDeVente {
  id: string;
  nom: string;
  adresse?: string;
  type_pdv?: string;
  responsable?: string;
  statut: string;
  created_at: string;
  updated_at: string;
}

export const usePointsDeVente = () => {
  return useQuery({
    queryKey: ['points-de-vente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .select('*')
        .eq('statut', 'actif')
        .order('nom', { ascending: true });
      
      if (error) {
        console.error('Erreur lors du chargement des points de vente:', error);
        throw error;
      }
      
      return data as PointDeVente[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};