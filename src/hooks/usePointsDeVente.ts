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
    queryKey: ['points-de-vente-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .select('id, nom, statut')
        .eq('statut', 'actif')
        .order('nom');
      
      if (error) {
        console.error('Erreur lors du chargement des points de vente:', error);
        throw error;
      }
      
      return data as PointDeVente[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - données de configuration
    refetchOnWindowFocus: false
  });
};