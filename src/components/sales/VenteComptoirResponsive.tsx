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

  // Hook vente comptoir avec gestion du stock PDV
  const {
    cart,
    stockPDV,
    pointsDeVente,
    addToCart,
    updateQuantity,
    updateRemise,
    removeFromCart,
    clearCart,
    createVente,
    getStockColor,
    isLoading
  } = useVenteComptoir(selectedPDV);

  // Hook catalogue optimisé avec pagination
  const { 
    categories, 
    totalCount,
    isLoading: loadingArticles
  } = useCatalogueOptimized(
    currentPage, 
    productsPerPage, 
    debouncedSearch, 
    selectedCategory === 'Tous' ? '' : selectedCategory
  );

  // Éliminer les doublons de catégories basés sur le stock PDV
  const uniqueCategories = useMemo(() => {
    if (!stockPDV) return [];
    const categorySet = new Set<string>();
    stockPDV.forEach(stockItem => {
      if (stockItem.article?.categorie && stockItem.article.categorie.trim()) {
        categorySet.add(stockItem.article.categorie);
      }
    });
    return Array.from(categorySet);
  }, [stockPDV]);

  // Calculer les totaux du panier
  const cartTotals = useMemo(() => {
    const sousTotal = cart.reduce((sum, item) => {
      const prixApresRemise = Math.max(0, item.prix_unitaire - (item.remise || 0));
      return sum + (prixApresRemise * item.quantite);
    }, 0);
    
    return {
      sousTotal,
      total: sousTotal
    };
  }, [cart]);

  // Sélectionner automatiquement le premier PDV disponible
  React.useEffect(() => {
    if (pointsDeVente && pointsDeVente.length > 0 && !selectedPDV) {
      setSelectedPDV(pointsDeVente[0].nom);
    }
  }, [pointsDeVente, selectedPDV]);

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

    if (!selectedPDV) {
      toast.error('Veuillez sélectionner un point de vente');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (paymentData: any) => {
    try {
      console.log('🔄 Données paiement reçues:', paymentData);
      
      const result = await createVente({
        client_id: selectedClient,
        cart: cart,
        montant_ht: cartTotals.total / 1.2,
        tva: cartTotals.total * 0.2 / 1.2,
        montant_ttc: cartTotals.total,
        mode_paiement: paymentData.mode_paiement,
        point_vente_id: selectedPDV,
        payment_data: paymentData // Passer les données de paiement
      });
      
      setLastFacture(result.facture);
      setShowPaymentModal(false);
      setShowPostPaymentActions(true);
      
      // Message de succès adaptatif
      if (paymentData.montant_paye === 0) {
        toast.success('Facture créée - Aucun paiement enregistré');
      } else if (paymentData.montant_paye < cartTotals.total) {
        toast.success('Facture créée - Paiement partiel enregistré');
      } else {
        toast.success('Facture créée - Paiement complet reçu');
      }
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
          pointsDeVente={pointsDeVente}
        />

        {/* Contenu principal */}
        <div className="flex-1 flex min-h-0">
          {/* Zone produits */}
          <ProductGrid
            stockPDV={stockPDV}
            loadingArticles={loadingArticles}
            addToCart={addToCart}
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            getStockColor={getStockColor}
            searchProduct={searchProduct}
            selectedCategory={selectedCategory}
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
