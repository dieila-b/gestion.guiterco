
import { useState, useEffect } from 'react';
import { useVenteComptoir } from '@/hooks/useVenteComptoir';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useDataProvider } from '@/providers/DataProvider';
import { supabase } from '@/integrations/supabase/client';

export const useVenteComptoirState = () => {
  const [selectedPDV, setSelectedPDV] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedClient, setSelectedClient] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPostPaymentActions, setShowPostPaymentActions] = useState(false);
  const [lastFacture, setLastFacture] = useState(null);

  const { fetchData, getCachedData } = useDataProvider();
  
  // Utiliser les hooks optimisés
  const venteComptoir = useVenteComptoir();
  const catalogue = useCatalogue();

  // Charger les données critiques en arrière-plan
  useEffect(() => {
    const loadCriticalData = async () => {
      try {
        await Promise.all([
          fetchData('points-de-vente', async () => {
            const { data } = await supabase.from('points_de_vente').select('*').limit(10);
            return data || [];
          }),
          fetchData('clients', async () => {
            const { data } = await supabase.from('clients').select('id, nom').limit(50);
            return data || [];
          })
        ]);
      } catch (error) {
        console.error('Erreur chargement données critiques:', error);
      }
    };

    loadCriticalData();
  }, [fetchData]);

  // Catégories filtrées et optimisées
  const uniqueCategories = venteComptoir.stockPDV
    ?.map(item => item.article?.categorie)
    .filter((cat, index, arr) => cat && arr.indexOf(cat) === index)
    .sort() || [];

  // Pagination optimisée
  const itemsPerPage = 20;
  const totalPages = Math.ceil((venteComptoir.stockPDV?.length || 0) / itemsPerPage);
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Calculs de totaux optimisés
  const cartTotals = {
    sousTotal: venteComptoir.cart?.reduce((sum, item) => sum + (item.prix_unitaire_brut * item.quantite), 0) || 0,
    total: venteComptoir.cart?.reduce((sum, item) => {
      const sousTotal = item.prix_unitaire_brut * item.quantite;
      const remise = (sousTotal * (item.remise_unitaire || 0)) / 100;
      return sum + (sousTotal - remise);
    }, 0) || 0
  };

  return {
    // États
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
    goToPage,
    showPaymentModal,
    setShowPaymentModal,
    showPostPaymentActions,
    setShowPostPaymentActions,
    lastFacture,
    setLastFacture,
    
    // Données optimisées
    venteComptoir,
    catalogue,
    uniqueCategories,
    cartTotals,
  };
};
