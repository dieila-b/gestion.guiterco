
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Minus, X, ShoppingCart, User, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalogueOptimized } from '@/hooks/useCatalogueOptimized';
import { useDebounce } from '@/hooks/useDebounce';
import { useVenteComptoir } from '@/hooks/useVenteComptoir';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';

const VenteComptoirResponsive = () => {
  const [selectedPDV, setSelectedPDV] = useState('PDV Madina');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedClient, setSelectedClient] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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

  // Hook vente comptoir
  const {
    cart,
    addToCart,
    updateQuantity,
    updateRemise,
    removeFromCart,
    clearCart,
    createVente,
    isLoading
  } = useVenteComptoir();

  // Éliminer les doublons de catégories
  const uniqueCategories = useMemo(() => {
    const categorySet = new Set(['Biscuits', 'Chocolat']);
    categories.forEach(cat => categorySet.add(cat));
    return Array.from(categorySet);
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

    try {
      await createVente.mutateAsync({
        client_id: selectedClient,
        point_vente: selectedPDV,
        articles: cart,
        montant_total: cartTotals.total
      });
      
      toast.success('Vente enregistrée avec succès');
    } catch (error) {
      console.error('Erreur lors de la vente:', error);
      toast.error('Erreur lors de l\'enregistrement de la vente');
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
        <div className="bg-white border-b p-4 flex-shrink-0 shadow-sm">
          <h1 className="text-xl font-bold mb-3">Vente au Comptoir</h1>
          
          {/* Contrôles */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <Select value={selectedPDV} onValueChange={setSelectedPDV}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDV Madina">PDV Madina</SelectItem>
                <SelectItem value="PDV Centre">PDV Centre</SelectItem>
                <SelectItem value="PDV Nord">PDV Nord</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'Tous' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('Tous')}
              size="sm"
            >
              Tous
            </Button>
            {uniqueCategories.slice(0, 5).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex min-h-0">
          {/* Zone produits - 50% */}
          <div className="w-1/2 border-r overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto p-4">
              {loadingArticles ? (
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {articles.map((article) => (
                    <div 
                      key={article.id}
                      className="border rounded-lg p-2 hover:shadow-md transition-all cursor-pointer bg-white group hover:bg-blue-50"
                      onClick={() => addToCart(article)}
                    >
                      <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                        {article.image_url ? (
                          <img 
                            src={article.image_url} 
                            alt={article.nom}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600 text-center px-1 leading-tight">
                              {article.nom.substring(0, 15)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-medium truncate mb-1 group-hover:text-blue-600">
                        {article.nom}
                      </div>
                      <div className="text-xs font-bold text-blue-600">
                        {formatCurrency(article.prix_vente || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t bg-white p-3 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Zone panier - 50% */}
          <div className="w-1/2 p-4 flex flex-col">
            {/* Panier élevé avec ombre forte */}
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full">
              {/* En-tête panier avec style élevé */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200 rounded-t-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                    <span className="font-bold text-lg text-gray-800">Panier ({cart.length})</span>
                  </div>
                  {cart.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-600 hover:text-red-700">
                      Vider
                    </Button>
                  )}
                </div>

                {/* Section client avec indicateur requis */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-600">Client requis</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Rechercher un client..."
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" variant="outline">
                      <User className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      Nouveau
                    </Button>
                  </div>
                </div>
              </div>

              {/* Articles du panier */}
              <div className="flex-1 overflow-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-1">Panier vide</p>
                    <p className="text-sm">Cliquez sur un produit pour l'ajouter</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {/* En-tête tableau */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-3">
                      <div className="col-span-4">Nom d'article</div>
                      <div className="col-span-1 text-center">Qté</div>
                      <div className="col-span-2 text-center">Remise</div>
                      <div className="col-span-2 text-center">P.U TTC</div>
                      <div className="col-span-2 text-center">Total</div>
                      <div className="col-span-1"></div>
                    </div>

                    {cart.map((item) => {
                      const prixApresRemise = Math.max(0, item.prix_vente - item.remise);
                      const totalLigne = prixApresRemise * item.quantite;
                      
                      return (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center py-3 border-b border-gray-100 text-sm hover:bg-gray-50 rounded px-2">
                          <div className="col-span-4">
                            <div className="font-medium truncate text-gray-800">{item.nom}</div>
                          </div>
                          
                          <div className="col-span-1">
                            <Input
                              type="number"
                              value={item.quantite}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="h-8 text-center text-xs font-medium"
                              min="1"
                            />
                          </div>

                          <div className="col-span-2">
                            <Input
                              type="number"
                              value={item.remise}
                              onChange={(e) => handleRemiseChange(item.id, e.target.value)}
                              placeholder="0"
                              className="h-8 text-center text-xs"
                              min="0"
                            />
                          </div>
                          
                          <div className="col-span-2 text-center font-medium text-gray-700">
                            {formatCurrency(prixApresRemise)}
                          </div>

                          <div className="col-span-2 text-center font-bold text-blue-600">
                            {formatCurrency(totalLigne)}
                          </div>

                          <div className="col-span-1 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Totaux et actions */}
              {cart.length > 0 && (
                <div className="border-t p-6 bg-gray-50 rounded-b-lg">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Sous-total</span>
                      <span className="font-medium">{formatCurrency(cartTotals.sousTotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl border-t pt-3">
                      <span className="text-gray-800">Total</span>
                      <span className="text-blue-600">{formatCurrency(cartTotals.total)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" onClick={clearCart}>
                        Annuler
                      </Button>
                      <Button variant="outline" size="sm">
                        Restaurer
                      </Button>
                      <Button variant="outline" size="sm">
                        En attente
                      </Button>
                    </div>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3" 
                      size="lg"
                      disabled={cart.length === 0 || !selectedClient || isLoading}
                      onClick={handlePayment}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {isLoading ? 'Traitement...' : 'PAIEMENT'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenteComptoirResponsive;
