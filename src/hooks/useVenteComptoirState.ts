
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

  // Hook catalogue optimisé
  const catalogue = useCatalogueOptimized();

  // Éliminer les doublons de catégories basés sur le stock PDV avec les relations correctes
  const uniqueCategories = useMemo(() => {
    if (!venteComptoir.stockPDV) return [];
    
    console.log('Calculating categories from stockPDV:', venteComptoir.stockPDV);
    
    const categorySet = new Set<string>();
    venteComptoir.stockPDV.forEach(stockItem => {
      if (stockItem.article?.categorie && stockItem.article.categorie.trim()) {
        categorySet.add(stockItem.article.categorie);
        console.log('Added category:', stockItem.article.categorie);
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

  const totalPages = Math.ceil((catalogue.articles?.length || 0) / productsPerPage);

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
