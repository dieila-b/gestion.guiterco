
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('🔍 Fetching catalogue data...');
      
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
          console.error('❌ Erreur lors du chargement du catalogue:', error);
          throw error;
        }
        
        console.log('✅ Catalogue data loaded successfully:', data?.length, 'articles');
        console.log('📊 First 3 articles:', data?.slice(0, 3));
        
        return data as Article[];
      } catch (err) {
        console.error('❌ Exception during catalogue fetch:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
