
import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useCatalogueOptimized } from '@/hooks/useCatalogueOptimized';
import { useVenteComptoir } from '@/hooks/useVenteComptoir';

export const useVenteComptoirState = () => {
  const [selectedPDV, setSelectedPDV] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedClient, setSelectedClient] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPostPaymentActions, setShowPostPaymentActions] = useState(false);
  const [lastFacture, setLastFacture] = useState<any>(null);
  const productsPerPage = 20;

  // Debounce pour la recherche
  const debouncedSearch = useDebounce(searchProduct, 300);

  // Hook vente comptoir avec gestion du stock PDV et stock local
  const venteComptoir = useVenteComptoir(selectedPDV);

  // Ne pas utiliser le catalogue optimisé - utiliser directement le stock PDV
  const catalogue = {
    isLoading: false,
    articles: [],
    totalCount: 0
  };

  // Éliminer les doublons de catégories basés sur le stock PDV avec les relations correctes
  const uniqueCategories = useMemo(() => {
    if (!venteComptoir.stockPDV) return [];
    
    console.log('Calculating categories from stockPDV:', venteComptoir.stockPDV);
    
    const categorySet = new Set<string>();
    venteComptoir.stockPDV.forEach(stockItem => {
      // Utiliser la catégorie depuis la relation ou depuis le champ direct
      const articleCategory = stockItem.article?.categorie_article?.nom || 
                             stockItem.article?.categorie || 
                             'Sans catégorie';
      
      if (articleCategory && articleCategory.trim()) {
        categorySet.add(articleCategory);
        console.log('Added category:', articleCategory);
      }
    });
    
    const categories = Array.from(categorySet).sort();
    console.log('Final unique categories:', categories);
    
    return categories;
  }, [venteComptoir.stockPDV]);

  // Calculer les totaux du panier
  const cartTotals = useMemo(() => {
    const sousTotal = venteComptoir.cart.reduce((sum, item) => {
      const prixApresRemise = Math.max(0, item.prix_unitaire_brut - (item.remise_unitaire || 0));
      return sum + (prixApresRemise * item.quantite);
    }, 0);
    
    return {
      sousTotal,
      total: sousTotal
    };
  }, [venteComptoir.cart]);

  // Calculer le total des pages basé sur le stock PDV filtré
  const filteredStockCount = useMemo(() => {
    if (!venteComptoir.stockPDV) return 0;
    
    return venteComptoir.stockPDV.filter(stockItem => {
      const article = stockItem.article;
      if (!article) return false;

      // Filtre par recherche
      const matchesSearch = !debouncedSearch || 
        article.nom.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        article.reference.toLowerCase().includes(debouncedSearch.toLowerCase());

      // Filtre par catégorie
      const articleCategory = article.categorie_article?.nom || article.categorie || 'Sans catégorie';
      const matchesCategory = selectedCategory === 'Tous' || 
        !selectedCategory || 
        selectedCategory === '' ||
        articleCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    }).length;
  }, [venteComptoir.stockPDV, debouncedSearch, selectedCategory]);

  const totalPages = Math.ceil(filteredStockCount / productsPerPage);

  // Sélectionner automatiquement le premier PDV disponible
  useEffect(() => {
    if (venteComptoir.pointsDeVente && venteComptoir.pointsDeVente.length > 0 && !selectedPDV) {
      setSelectedPDV(venteComptoir.pointsDeVente[0].nom);
    }
  }, [venteComptoir.pointsDeVente, selectedPDV]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    // State
    selectedPDV,
    setSelectedPDV,
    searchProduct,
    setSearchProduct,
    selectedCategory,
    setSelectedCategory,
    selectedClient,
    setSelectedClient,
    currentPage,
    totalPages,
    showPaymentModal,
    setShowPaymentModal,
    showPostPaymentActions,
    setShowPostPaymentActions,
    lastFacture,
    setLastFacture,
    
    // Computed values
    uniqueCategories,
    cartTotals,
    
    // Functions
    goToPage,
    
    // Hooks data
    venteComptoir,
    catalogue
  };
};
