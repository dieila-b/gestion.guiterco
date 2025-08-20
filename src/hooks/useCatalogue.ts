
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Article {
  id: string;
  nom: string;
  reference: string;
  prix_achat?: number;
  prix_vente?: number;
  prix_unitaire?: number; // Maintenu pour compatibilité
  categorie?: string;
  unite_mesure?: string;
  description?: string;
  image_url?: string;
  statut?: string;
  seuil_alerte?: number;
  categorie_id?: string;
  unite_id?: string;
}

export const useCatalogue = () => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['catalogue'],
    queryFn: async () => {
      console.log('Fetching catalogue data...');
      
      try {
        const { data, error } = await supabase
          .from('catalogue')
          .select(`
            id,
            nom,
            reference,
            description,
            prix_achat,
            prix_vente,
            prix_unitaire,
            categorie,
            unite_mesure,
            categorie_id,
            unite_id,
            seuil_alerte,
            image_url,
            statut,
            created_at,
            updated_at
          `)
          .eq('statut', 'actif')
          .order('nom', { ascending: true });
        
        if (error) {
          console.error('Erreur lors du chargement du catalogue:', error);
          throw error;
        }
        
        console.log('Catalogue data loaded:', data?.length, 'articles');
        return data as Article[];
      } catch (error) {
        console.error('Error in catalogue query:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    articles,
    isLoading,
    error
  };
};

// Re-export optimized version
export * from './useCatalogueOptimized';
