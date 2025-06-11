
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface ArticleOptimized {
  id: string;
  nom: string;
  reference: string;
  prix_achat?: number;
  prix_vente?: number;
  categorie?: string;
  image_url?: string; // Nouveau champ pour l'image
}

// Hook optimisé avec pagination et filtrage côté serveur
export const useCatalogueOptimized = (
  page = 1, 
  limit = 20, 
  searchTerm = '', 
  category = ''
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, isLoading, error } = useQuery({
    queryKey: ['catalogue_optimized', page, limit, searchTerm, category],
    queryFn: async () => {
      let query = supabase
        .from('catalogue')
        .select('id, nom, reference, prix_achat, prix_vente, categorie, image_url', { count: 'exact' })
        .eq('statut', 'actif')
        .range(from, to);

      // Filtrage côté serveur
      if (searchTerm) {
        query = query.or(`nom.ilike.%${searchTerm}%,reference.ilike.%${searchTerm}%`);
      }
      
      if (category && category !== 'all') {
        query = query.eq('categorie', category);
      }

      query = query.order('nom', { ascending: true });
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      return { 
        articles: data as ArticleOptimized[], 
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes pour le catalogue
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Mémorisation des catégories pour éviter les re-calculs
  const categories = useMemo(() => {
    if (!data?.articles) return [];
    const uniqueCategories = [...new Set(data.articles.map(a => a.categorie).filter(Boolean))];
    return uniqueCategories;
  }, [data?.articles]);

  return {
    articles: data?.articles || [],
    totalCount: data?.totalCount || 0,
    hasMore: data?.hasMore || false,
    categories,
    isLoading,
    error
  };
};

// Hook pour recherche en temps réel avec debounce
export const useCatalogueSearch = (searchTerm: string, enabled = false) => {
  return useQuery({
    queryKey: ['catalogue_search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('catalogue')
        .select('id, nom, reference, prix_achat, prix_vente, image_url')
        .eq('statut', 'actif')
        .or(`nom.ilike.%${searchTerm}%,reference.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data as ArticleOptimized[];
    },
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};
