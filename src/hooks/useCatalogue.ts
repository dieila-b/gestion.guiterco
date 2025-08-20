
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCatalogueOptimized } from './useCatalogueOptimized';

export interface Article {
  id: string;
  nom: string;
  reference: string;
  prix_achat?: number;
  prix_vente?: number;
  prix_unitaire?: number;
  categorie?: string;
  unite_mesure?: string;
  description?: string;
  image_url?: string;
  statut?: string;
  seuil_alerte?: number;
  categorie_id?: string;
  unite_id?: string;
  frais_logistique?: number;
  frais_douane?: number;
  frais_transport?: number;
  autres_frais?: number;
}

export const useCatalogue = () => {
  const { data: articles, isLoading, error, refetch } = useQuery({
    queryKey: ['catalogue'],
    queryFn: async () => {
      console.log('🔍 Fetching catalogue data (legacy)...');
      
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
            frais_logistique,
            frais_douane,
            frais_transport,
            autres_frais,
            created_at,
            updated_at
          `)
          .order('nom', { ascending: true });
        
        if (error) {
          console.error('❌ Erreur catalogue legacy:', error);
          throw error;
        }
        
        console.log('✅ Catalogue legacy data loaded:', data?.length, 'articles');
        return data as Article[];
      } catch (err) {
        console.error('❌ Exception catalogue legacy:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000
  });

  return {
    articles,
    isLoading,
    error,
    refetch
  };
};

// Re-export optimized version
export * from './useCatalogueOptimized';
