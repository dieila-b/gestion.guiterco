
import React from 'react';
import VenteHeader from './VenteHeader';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';

interface VenteMainContentProps {
  // Header props
  selectedPDV: string;
  setSelectedPDV: (pdv: string) => void;
  searchProduct: string;
  setSearchProduct: (search: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  uniqueCategories: string[];
  pointsDeVente: any[];
  
  // Product grid props
  stockPDV?: any[];
  loadingArticles: boolean;
  addToCart: (article: any) => void;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  getStockColor: (quantite: number) => string;
  getLocalStock: (articleId: string) => number;
  
  // Cart props
  cart: any[];
  cartTotals: { sousTotal: number; total: number };
  selectedClient: string;
  setSelectedClient: (client: string) => void;
  handleQuantityChange: (productId: string, newQuantity: string) => void;
  handleRemiseChange: (productId: string, newRemise: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  handlePayment: () => void;
  isLoading: boolean;
}

const VenteMainContent: React.FC<VenteMainContentProps> = ({
  selectedPDV,
  setSelectedPDV,
  searchProduct,
  setSearchProduct,
  selectedCategory,
  setSelectedCategory,
  uniqueCategories,
  pointsDeVente,
  stockPDV,
  loadingArticles,
  addToCart,
  currentPage,
  totalPages,
  goToPage,
  getStockColor,
  getLocalStock,
  cart,
  cartTotals,
  selectedClient,
  setSelectedClient,
  handleQuantityChange,
  handleRemiseChange,
  removeFromCart,
  clearCart,
  handlePayment,
  isLoading
}) => {
  return (
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
        {/* Zone produits avec stock temps réel */}
        <ProductGrid
          stockPDV={stockPDV}
          loadingArticles={loadingArticles}
          addToCart={addToCart}
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          getStockColor={getStockColor}
          getLocalStock={getLocalStock}
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
  );
};

export default VenteMainContent;
