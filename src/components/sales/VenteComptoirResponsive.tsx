
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
import NewClientDialog from './components/cart/NewClientDialog';

const VenteComptoirResponsive = () => {
  const [selectedPDV, setSelectedPDV] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedClient, setSelectedClient] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPostPaymentActions, setShowPostPaymentActions] = useState(false);
  const [lastFacture, setLastFacture] = useState<any>(null);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
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
      const prixApresRemise = Math.max(0, item.prix_vente - item.remise);
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

    // Vérifier que selectedClient est bien un UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(selectedClient)) {
      toast.error('Client sélectionné invalide. Veuillez sélectionner un client valide.');
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

  const handleNewClient = () => {
    setShowNewClientDialog(true);
  };

  const handleClientCreated = (clientId: string, clientName: string) => {
    console.log('Nouveau client créé:', { id: clientId, name: clientName });
    setSelectedClient(clientId); // Utiliser l'ID, pas le nom
    setShowNewClientDialog(false);
    toast.success(`Client ${clientName} créé avec succès`);
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

        {/* Contenu principal - Responsive */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Zone produits - responsive avec flex-grow */}
          <div className={`flex-1 min-w-0 transition-all duration-300 ${
            isCartOpen ? 'lg:flex-1' : 'w-full'
          }`}>
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
          </div>

          {/* Zone panier - responsive avec overlay sur mobile */}
          <div className={`
            ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            fixed lg:relative top-0 right-0 h-full w-full sm:w-96 lg:w-80 xl:w-96 
            bg-white shadow-lg lg:shadow-none border-l border-gray-200 
            transition-transform duration-300 ease-in-out z-30
          `}>
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
              onNewClient={handleNewClient}
              onClose={() => setIsCartOpen(false)}
            />
          </div>

          {/* Overlay pour mobile */}
          {isCartOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setIsCartOpen(false)}
            />
          )}

          {/* Bouton panier flottant pour mobile */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 lg:hidden bg-blue-600 text-white p-4 rounded-full shadow-lg z-40 flex items-center justify-center"
          >
            <div className="relative">
              🛒
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
          </button>
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

      {/* Dialog nouveau client */}
      <NewClientDialog
        isOpen={showNewClientDialog}
        onClose={() => setShowNewClientDialog(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default VenteComptoirResponsive;
