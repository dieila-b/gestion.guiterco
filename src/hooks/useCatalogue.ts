
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
      console.log('🔍 Fetching catalogue data...');
      
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
        .order('nom', { ascending: true });
      
      console.log('📊 Raw catalogue data from Supabase:', data);
      console.log('📈 Number of articles:', data?.length);
      
      if (error) {
        console.error('❌ Erreur lors du chargement du catalogue:', error);
        throw error;
      }
      
      // Log détaillé des statuts pour diagnostic
      if (data) {
        const statusCount = data.reduce((acc, item) => {
          const status = item.statut || 'undefined';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('📋 Articles par statut:', statusCount);
        console.log('🔍 Premiers 3 articles:', data.slice(0, 3));
      }
      
      console.log('✅ Catalogue data loaded successfully:', data?.length, 'articles');
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
