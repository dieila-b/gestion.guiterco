
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export interface ArticleOptimized {
  id: string;
  nom: string;
  reference: string;
  prix_vente: number;
  image_url?: string;
  categorie?: string;
  unite_mesure?: string;
  description?: string;
  statut?: string;
}

export interface CatalogueResponse {
  articles: ArticleOptimized[];
  totalCount: number;
  hasMore: boolean;
  categories: string[];
  isLoading: boolean;
  error?: Error;
}

export const useCatalogue = (
  searchTerm = '',
  selectedCategory = '',
  page = 0,
  pageSize = 50
): CatalogueResponse => {
  const { user, isDevMode } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['catalogue', searchTerm, selectedCategory, page, pageSize],
    queryFn: async () => {
      console.log('🔄 Chargement catalogue avec params:', { 
        searchTerm, 
        selectedCategory, 
        page, 
        pageSize,
        isDevMode,
        hasUser: !!user
      });

      try {
        let query = supabase
          .from('catalogue')
          .select(`
            id,
            nom,
            reference,
            prix_vente,
            image_url,
            categorie,
            unite_mesure,
            description,
            statut,
            categories_catalogue!catalogue_categorie_id_fkey(nom)
          `)
          .eq('statut', 'actif')
          .order('nom');

        // Filtres
        if (searchTerm) {
          query = query.or(`nom.ilike.%${searchTerm}%,reference.ilike.%${searchTerm}%`);
        }

        if (selectedCategory) {
          query = query.eq('categorie', selectedCategory);
        }

        // Pagination
        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data: articles, error, count } = await query;

        if (error) {
          console.error('❌ Erreur chargement catalogue:', error);
          throw error;
        }

        console.log('✅ Articles chargés:', articles?.length || 0);

        // Normaliser les données
        const normalizedArticles: ArticleOptimized[] = (articles || []).map(article => ({
          id: article.id,
          nom: article.nom,
          reference: article.reference,
          prix_vente: article.prix_vente || 0,
          image_url: article.image_url,
          categorie: article.categories_catalogue?.nom || article.categorie || '',
          unite_mesure: article.unite_mesure || '',
          description: article.description || '',
          statut: article.statut
        }));

        // Extraire les catégories uniques
        const categories = Array.from(new Set(
          normalizedArticles
            .map(a => a.categorie)
            .filter(cat => cat && cat.trim() !== '')
        ));

        return {
          articles: normalizedArticles,
          totalCount: count || 0,
          categories
        };

      } catch (error) {
        console.error('❌ Erreur lors du chargement du catalogue:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    articles: data?.articles || [],
    totalCount: data?.totalCount || 0,
    hasMore: (data?.totalCount || 0) > (page + 1) * pageSize,
    categories: data?.categories || [],
    isLoading,
    error: error as Error
  };
};
