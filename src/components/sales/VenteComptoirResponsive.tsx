
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Minus, X, ShoppingCart, User, CreditCard } from 'lucide-react';
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

  // Debounce pour la recherche
  const debouncedSearch = useDebounce(searchProduct, 300);

  // Hook catalogue optimisé
  const { 
    articles, 
    categories, 
    isLoading: loadingArticles
  } = useCatalogueOptimized(
    1, 
    50, 
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

  // Calculer les totaux du panier
  const cartTotals = useMemo(() => {
    const sousTotal = cart.reduce((sum, item) => {
      const prixAvecRemise = item.prix_vente * (1 - item.remise / 100);
      return sum + (prixAvecRemise * item.quantite);
    }, 0);
    
    return {
      sousTotal,
      total: sousTotal
    };
  }, [cart]);

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

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* En-tête */}
        <div className="bg-card border-b p-4 flex-shrink-0">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            {categories.slice(0, 5).map((category) => (
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

        {/* Contenu principal - Division 50/50 */}
        <div className="flex-1 flex min-h-0">
          {/* Zone produits - 50% */}
          <div className="w-1/2 border-r overflow-auto">
            <div className="p-4">
              {loadingArticles ? (
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-1"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {articles.map((article) => (
                    <div 
                      key={article.id}
                      className="border rounded-lg p-2 hover:shadow-md transition-all cursor-pointer bg-background group"
                      onClick={() => addToCart(article)}
                    >
                      <div className="aspect-square bg-muted rounded mb-2 flex items-center justify-center overflow-hidden">
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
                      <div className="text-xs font-medium truncate mb-1 group-hover:text-primary">
                        {article.nom}
                      </div>
                      <div className="text-xs font-bold text-primary">
                        {formatCurrency(article.prix_vente || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Zone panier - 50% */}
          <div className="w-1/2 flex flex-col">
            {/* En-tête panier */}
            <div className="border-b p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-semibold">Panier ({cart.length})</span>
                </div>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    Vider
                  </Button>
                )}
              </div>

              {/* Section client */}
              <div className="flex items-center gap-2 mb-3">
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

            {/* Articles du panier */}
            <div className="flex-1 overflow-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Panier vide</p>
                  <p className="text-sm">Cliquez sur un produit pour l'ajouter</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const prixAvecRemise = item.prix_vente * (1 - item.remise / 100);
                    const totalLigne = prixAvecRemise * item.quantite;
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-3 bg-background">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.nom}</div>
                            <div className="text-sm text-muted-foreground">
                              P.U: {formatCurrency(item.prix_vente)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantite - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantite}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantite + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold text-primary">
                              {formatCurrency(totalLigne)}
                            </div>
                          </div>
                        </div>

                        {/* Remise */}
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Remise:</span>
                          <Input
                            type="number"
                            value={item.remise}
                            onChange={(e) => updateRemise(item.id, Number(e.target.value))}
                            className="w-16 h-7 text-center text-sm"
                            min="0"
                            max="100"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Totaux et actions */}
            {cart.length > 0 && (
              <div className="border-t p-4 flex-shrink-0">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{formatCurrency(cartTotals.sousTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(cartTotals.total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
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
                    className="w-full bg-purple-600 hover:bg-purple-700" 
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
  );
};

export default VenteComptoirResponsive;
