
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Article {
  id: string;
  nom: string;
  reference: string;
  prix_unitaire?: number;
  categorie?: string;
  unite_mesure?: string;
  description?: string;
}

// Version legacy maintenue pour compatibilité
export const useCatalogue = () => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['catalogue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogue')
        .select('id, nom, reference, prix_unitaire, categorie, unite_mesure, description')
        .eq('statut', 'actif')
        .order('nom', { ascending: true });
      
      if (error) throw error;
      return data as Article[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

  return {
    articles,
    isLoading,
    error
  };
};

// Re-export optimized version
export * from './useCatalogueOptimized';
