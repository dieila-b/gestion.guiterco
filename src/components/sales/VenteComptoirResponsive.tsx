
import React, { useState, useMemo } from 'react';
import { useCatalogueOptimized } from '@/hooks/useCatalogueOptimized';
import { useDebounce } from '@/hooks/useDebounce';
import { useVenteComptoir } from '@/hooks/useVenteComptoir';
import { toast } from 'sonner';
import VenteHeader from './components/VenteHeader';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import PaymentModal from './components/PaymentModal';
import PostPaymentActions from './components/PostPaymentActions';

const VenteComptoirResponsive = () => {
  const [selectedPDV, setSelectedPDV] = useState('PDV Madina');
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

  // Hook catalogue optimisé avec pagination
  const { 
    articles, 
    categories, 
    totalCount,
    isLoading: loadingArticles
  } = useCatalogueOptimized(
    currentPage, 
    productsPerPage, 
    debouncedSearch, 
    selectedCategory === 'Tous' ? '' : selectedCategory
  );

  // Hook vente comptoir avec gestion du stock PDV
  const {
    cart,
    stockPDV,
    addToCart,
    updateQuantity,
    updateRemise,
    removeFromCart,
    clearCart,
    createVente,
    getStockColor,
    isLoading
  } = useVenteComptoir(selectedPDV);

  // Éliminer les doublons de catégories
  const uniqueCategories = useMemo(() => {
    const categorySet = new Set();
    categories.forEach(cat => {
      if (cat && cat.trim()) {
        categorySet.add(cat);
      }
    });
    return Array.from(categorySet) as string[];
  }, [categories]);

  // Calculer les totaux du panier
  const cartTotals = useMemo(() => {
    const sousTotal = cart.reduce((sum, item) => {
      const prixApresRemise = Math.max(0, item.prix_vente - item.remise);
      return sum + (prixApresRemise * item.quantite);
    }, 0);
    
    return {
      sousTotal,
      total: sousTotal
    };
  }, [cart]);

  const totalPages = Math.ceil(totalCount / productsPerPage);

  const handlePayment = async () => {
    if (!selectedClient) {
      toast.error('Veuillez sélectionner un client');
      return;
    }

    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (paymentData: any) => {
    try {
      const result = await createVente.mutateAsync({
        client_id: selectedClient,
        point_vente: selectedPDV,
        articles: cart,
        montant_total: cartTotals.total,
        montant_paye: paymentData.montant_paye,
        mode_paiement: paymentData.mode_paiement,
        statut_livraison: paymentData.statut_livraison,
        quantite_livree: paymentData.quantite_livree,
        notes: paymentData.notes
      });
      
      setLastFacture(result.facture);
      setShowPaymentModal(false);
      setShowPostPaymentActions(true);
    } catch (error) {
      console.error('Erreur lors de la vente:', error);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 0;
    if (quantity > 0) {
      updateQuantity(productId, quantity);
    }
  };

  const handleRemiseChange = (productId: string, newRemise: string) => {
    const remise = parseFloat(newRemise) || 0;
    updateRemise(productId, remise);
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* En-tête */}
        <VenteHeader
          selectedPDV={selectedPDV}
          setSelectedPDV={setSelectedPDV}
          searchProduct={searchProduct}
          setSearchProduct={setSearchProduct}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          uniqueCategories={uniqueCategories}
        />

        {/* Contenu principal */}
        <div className="flex-1 flex min-h-0">
          {/* Zone produits */}
          <ProductGrid
            articles={articles}
            stockPDV={stockPDV}
            loadingArticles={loadingArticles}
            addToCart={addToCart}
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            getStockColor={getStockColor}
          />

          {/* Zone panier */}
          <CartPanel
            cart={cart}
            cartTotals={cartTotals}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            handleQuantityChange={handleQuantityChange}
            handleRemiseChange={handleRemiseChange}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            handlePayment={handlePayment}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Modal de paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        totalAmount={cartTotals.total}
        cartItems={cart}
        isLoading={isLoading}
      />

      {/* Actions post-paiement */}
      <PostPaymentActions
        isOpen={showPostPaymentActions}
        onClose={() => setShowPostPaymentActions(false)}
        factureData={lastFacture || {}}
      />
    </div>
  );
};

export default VenteComptoirResponsive;
