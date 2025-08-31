
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

  // Hook catalogue optimisé avec pagination
  const catalogue = useCatalogueOptimized(
    currentPage, 
    productsPerPage, 
    debouncedSearch, 
    selectedCategory === 'Tous' ? '' : selectedCategory
  );

  // Éliminer les doublons de catégories basés sur le stock PDV avec les relations correctes
  const uniqueCategories = useMemo(() => {
    // Safety check to ensure stockPDV is an array
    const safeStockPDV = Array.isArray(venteComptoir.stockPDV) ? venteComptoir.stockPDV : [];
    
    if (safeStockPDV.length === 0) {
      console.log('No stockPDV data available for categories');
      return [];
    }
    
    console.log('Calculating categories from stockPDV:', safeStockPDV);
    
    const categorySet = new Set<string>();
    safeStockPDV.forEach(stockItem => {
      if (stockItem && stockItem.article && stockItem.article.categorie && stockItem.article.categorie.trim()) {
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
    // Safety check to ensure cart is an array
    const safeCart = Array.isArray(venteComptoir.cart) ? venteComptoir.cart : [];
    
    const sousTotal = safeCart.reduce((sum, item) => {
      if (!item) return sum;
      const prixApresRemise = Math.max(0, (item.prix_unitaire_brut || 0) - (item.remise_unitaire || 0));
      return sum + (prixApresRemise * (item.quantite || 0));
    }, 0);
    
    return {
      sousTotal,
      total: sousTotal
    };
  }, [venteComptoir.cart]);

  const totalPages = Math.ceil((catalogue.totalCount || 0) / productsPerPage);

  // Sélectionner automatiquement le premier PDV disponible
  useEffect(() => {
    const safePointsDeVente = Array.isArray(venteComptoir.pointsDeVente) ? venteComptoir.pointsDeVente : [];
    if (safePointsDeVente.length > 0 && !selectedPDV) {
      setSelectedPDV(safePointsDeVente[0].nom);
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
    
    // Hooks data with safety checks
    venteComptoir: {
      ...venteComptoir,
      cart: Array.isArray(venteComptoir.cart) ? venteComptoir.cart : [],
      stockPDV: Array.isArray(venteComptoir.stockPDV) ? venteComptoir.stockPDV : [],
      pointsDeVente: Array.isArray(venteComptoir.pointsDeVente) ? venteComptoir.pointsDeVente : []
    },
    catalogue: {
      ...catalogue,
      data: Array.isArray(catalogue.data) ? catalogue.data : []
    }
  };
};
