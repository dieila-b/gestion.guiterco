
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, User, ShoppingCart, Image } from 'lucide-react';
import { useCommandesClientsRecent } from '@/hooks/useSalesOptimized';
import { useCatalogueOptimized } from '@/hooks/useCatalogueOptimized';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDebounce } from '@/hooks/useDebounce';

const VenteComptoirOptimized = () => {
  const [selectedPDV, setSelectedPDV] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce pour la recherche
  const debouncedSearch = useDebounce(searchProduct, 300);

  // Hooks optimisés
  const { data: commandes, isLoading: loadingCommandes } = useCommandesClientsRecent(5);
  const { 
    articles, 
    categories, 
    isLoading: loadingArticles,
    hasMore 
  } = useCatalogueOptimized(
    currentPage, 
    12, 
    debouncedSearch, 
    selectedCategory
  );

  // Mémorisation de la fonction de couleur des badges
  const getStatusBadgeColor = useCallback((statut: string) => {
    switch (statut) {
      case 'en_cours': return 'default';
      case 'confirmee': return 'secondary';
      case 'livree': return 'outline';
      case 'annulee': return 'destructive';
      default: return 'default';
    }
  }, []);

  // Mémorisation des produits filtrés
  const filteredArticles = useMemo(() => {
    return articles || [];
  }, [articles]);

  const handleLoadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchProduct(value);
    setCurrentPage(1);
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return `${amount.toLocaleString()} GNF`;
  }, []);

  if (loadingCommandes && loadingArticles) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header optimisé */}
      <div>
        <h2 className="text-2xl font-bold">Vente au comptoir</h2>
      </div>

      {/* Ligne supérieure optimisée */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Point de vente</label>
          <Select value={selectedPDV} onValueChange={setSelectedPDV}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner PDV" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdv1">PDV Principal</SelectItem>
              <SelectItem value="pdv2">PDV Secondaire</SelectItem>
              <SelectItem value="pdv3">PDV Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Recherche produit</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Scanner ou rechercher..."
              value={searchProduct}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Catégorie</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map((cat: string) => (
                <SelectItem key={cat as string} value={cat as string}>
                  {cat as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Client requis</label>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client1">Jean Dupont</SelectItem>
                <SelectItem value="client2">Marie Martin</SelectItem>
                <SelectItem value="client3">Pierre Bernard</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Zone principale optimisée */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Panier actuel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Panier actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Aucun article dans le panier
              </div>
            </CardContent>
          </Card>

          {/* Produits avec images et devise GNF */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Produits</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingArticles ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredArticles.map((article) => (
                      <div 
                        key={article.id} 
                        className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                          {article.image_url ? (
                            <img 
                              src={article.image_url} 
                              alt={article.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <div className="text-sm font-medium truncate">{article.nom}</div>
                        <div className="text-sm text-gray-500">{article.reference}</div>
                        <div className="font-bold text-blue-600">
                          {article.prix_vente ? formatCurrency(article.prix_vente) : '0 GNF'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {hasMore && (
                    <div className="text-center mt-4">
                      <Button variant="outline" onClick={handleLoadMore}>
                        Charger plus
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Actions de vente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle vente
              </Button>
              <Button variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Gestion client
              </Button>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filtres avancés
              </Button>
            </CardContent>
          </Card>

          {/* Résumé avec devise GNF */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total:</span>
                <span>0 GNF</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA (20%):</span>
                <span>0 GNF</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total TTC:</span>
                  <span>0 GNF</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historique optimisé avec devise GNF */}
      <Card>
        <CardHeader>
          <CardTitle>Ventes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commandes && commandes.map((commande) => (
              <div key={commande.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{commande.numero_commande}</div>
                    <div className="text-sm text-gray-500">
                      {commande.client ? commande.client.nom : 'Client non spécifié'}
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeColor(commande.statut)}>
                    {commande.statut}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(commande.montant_ttc)}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(commande.date_commande), 'dd/MM HH:mm', { locale: fr })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VenteComptoirOptimized;
