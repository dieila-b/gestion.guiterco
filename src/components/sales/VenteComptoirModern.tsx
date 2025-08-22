
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Minus, X, ShoppingCart, User } from 'lucide-react';
import { useCatalogueOptimized } from '@/hooks/useCatalogueOptimized';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/lib/currency';

interface CartItem {
  id: string;
  nom: string;
  prix_vente: number;
  quantite: number;
  remise: number;
}

const VenteComptoirModern = () => {
  const [selectedPDV, setSelectedPDV] = useState('PDV Madina');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [cart, setCart] = useState<CartItem[]>([]);
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
    20, 
    debouncedSearch, 
    selectedCategory === 'Tous' ? '' : selectedCategory
  );

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

  // Ajouter un produit au panier
  const addToCart = useCallback((article: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === article.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === article.id
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      }
      
      return [...prevCart, {
        id: article.id,
        nom: article.nom,
        prix_vente: article.prix_vente || 0,
        quantite: 1,
        remise: 0
      }];
    });
  }, []);

  // Modifier la quantité d'un produit
  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    } else {
      setCart(prevCart => 
        prevCart.map(item =>
          item.id === productId
            ? { ...item, quantite: newQuantity }
            : item
        )
      );
    }
  }, []);

  // Supprimer un produit du panier
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  // Vider le panier
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Vente au Comptoir</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone principale - Produits (2/3 de l'écran) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Barre de navigation et filtres */}
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Select value={selectedPDV} onValueChange={setSelectedPDV}>
                  <SelectTrigger className="w-full md:w-48">
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
                <Button
                  variant={selectedCategory === 'Biscuits' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('Biscuits')}
                  size="sm"
                >
                  Biscuits
                </Button>
                {categories.map((category: string) => (
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

            {/* Grille des produits */}
            <div className="bg-card rounded-lg p-4 border">
              {loadingArticles ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-1"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {articles.map((article: any) => (
                    <div 
                      key={article.id}
                      className="border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer bg-background"
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
                            <span className="text-xs font-bold text-blue-600 text-center px-2">
                              {article.nom}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium truncate mb-1">{article.nom}</div>
                      <div className="text-xs text-muted-foreground mb-1">{article.reference}</div>
                      <div className="font-bold text-primary">
                        {formatCurrency(article.prix_vente || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panier à droite (1/3 de l'écran) */}
          <div className="space-y-4">
            {/* En-tête du panier */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Panier ({cart.length})
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Section client requis */}
            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>

            {/* Articles du panier */}
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="space-y-4 mb-4">
                  {/* En-têtes du tableau */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                    <div className="col-span-4">Nom d'article</div>
                    <div className="col-span-2 text-center">Quantité</div>
                    <div className="col-span-2 text-center">Remise</div>
                    <div className="col-span-3 text-right">Prix/Total</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>

                  {/* Items du panier */}
                  {cart.map((item) => {
                    const prixAvecRemise = item.prix_vente * (1 - item.remise / 100);
                    const totalLigne = prixAvecRemise * item.quantite;
                    
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center py-2 border-b">
                        <div className="col-span-4">
                          <div className="text-sm font-medium truncate">{item.nom}</div>
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantite - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantite}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantite + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="col-span-2 text-center">
                          <Input
                            type="number"
                            value={item.remise}
                            onChange={(e) => {
                              const newRemise = Number(e.target.value);
                              setCart(prevCart => 
                                prevCart.map(cartItem =>
                                  cartItem.id === item.id
                                    ? { ...cartItem, remise: newRemise }
                                    : cartItem
                                )
                              );
                            }}
                            className="h-6 text-xs text-center"
                            min="0"
                            max="100"
                          />
                          <div className="text-xs text-muted-foreground">%</div>
                        </div>
                        
                        <div className="col-span-3 text-right">
                          <div className="text-xs text-muted-foreground">
                            P.U: {formatCurrency(item.prix_vente)}
                          </div>
                          <div className="text-sm font-bold text-primary">
                            {formatCurrency(totalLigne)}
                          </div>
                        </div>
                        
                        <div className="col-span-1 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {cart.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Panier vide
                    </div>
                  )}
                </div>

                {/* Totaux */}
                {cart.length > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total</span>
                      <span>{formatCurrency(cartTotals.sousTotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(cartTotals.total)}</span>
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="mt-4 space-y-2">
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
                    disabled={cart.length === 0 || !selectedClient}
                  >
                    💳 PAIEMENT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenteComptoirModern;
