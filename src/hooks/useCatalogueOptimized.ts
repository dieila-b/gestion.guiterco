
import { useUltraFastCatalogue } from './useUltraCache';
import { useMemo } from 'react';

export interface ArticleOptimized {
  id: string;
  nom: string;
  reference?: string;
  description?: string;
  prix_vente?: number;
  prix_achat?: number;
  prix_unitaire?: number;
  categorie?: string;
  categories?: {
    nom: string;
    couleur?: string;
  };
  unite?: string;
  unites?: {
    nom: string;
    symbole: string;
  };
  unite_mesure?: string;
  seuil_alerte?: number;
  image_url?: string;
  statut?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCatalogueOptimized = (
  page = 1, 
  limit = 20, 
  searchTerm = '', 
  selectedCategory = 'all'
) => {
  const { data: articles, isLoading } = useUltraFastCatalogue();

  const { paginatedArticles, categories, hasMore } = useMemo(() => {
    console.log('📦 Traitement catalogue optimisé avec données synchronisées:', {
      totalArticles: articles?.length || 0,
      page,
      limit,
      searchTerm,
      selectedCategory
    });

    if (!articles || articles.length === 0) {
      return { 
        paginatedArticles: [], 
        categories: [], 
        hasMore: false 
      };
    }

    // Filtrer les articles
    let filteredArticles = articles;

    // Recherche textuelle
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredArticles = filteredArticles.filter(article =>
        article.nom?.toLowerCase().includes(search) ||
        article.reference?.toLowerCase().includes(search) ||
        article.categorie?.toLowerCase().includes(search)
      );
    }

    // Filtre par catégorie
    if (selectedCategory && selectedCategory !== 'all') {
      filteredArticles = filteredArticles.filter(article => {
        const articleCategory = article.categories?.nom || article.categorie || 'Général';
        return articleCategory === selectedCategory;
      });
    }

    // Extraire les catégories uniques depuis les données synchronisées
    const uniqueCategories = [...new Set(
      articles.map(article => article.categories?.nom || article.categorie || 'Général')
    )].filter(Boolean).sort();

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredArticles.slice(startIndex, endIndex);

    console.log('📊 Résultats filtrage avec données synchronisées:', {
      filteredCount: filteredArticles.length,
      paginatedCount: paginatedResults.length,
      categories: uniqueCategories.length,
      categoriesFound: uniqueCategories
    });

    return {
      paginatedArticles: paginatedResults,
      categories: uniqueCategories,
      hasMore: endIndex < filteredArticles.length
    };
  }, [articles, page, limit, searchTerm, selectedCategory]);

  return {
    articles: paginatedArticles,
    categories,
    isLoading,
    hasMore,
    totalCount: articles?.length || 0
  };
};
