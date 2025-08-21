
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Plus, Image } from 'lucide-react';

interface ProductGridProps {
  stockPDV?: any[];
  loadingArticles: boolean;
  addToCart: (article: any) => void;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  getStockColor: (quantite: number) => string;
  getLocalStock: (articleId: string) => number;
  searchProduct: string;
  selectedCategory: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  stockPDV,
  loadingArticles,
  addToCart,
  currentPage,
  totalPages,
  goToPage,
  getStockColor,
  getLocalStock,
  searchProduct,
  selectedCategory
}) => {
  console.log('ProductGrid - stockPDV:', stockPDV);
  console.log('ProductGrid - selectedCategory:', selectedCategory);

  // Filtrer les produits selon les critères
  const filteredProducts = React.useMemo(() => {
    if (!stockPDV || stockPDV.length === 0) {
      console.log('Pas de stock PDV disponible');
      return [];
    }

    let filtered = [...stockPDV];

    // Filtrage par recherche
    if (searchProduct) {
      const search = searchProduct.toLowerCase();
      filtered = filtered.filter(item =>
        item.article?.nom?.toLowerCase().includes(search) ||
        item.article?.reference?.toLowerCase().includes(search)
      );
    }

    // Filtrage par catégorie
    if (selectedCategory && selectedCategory !== 'Tous') {
      filtered = filtered.filter(item => {
        const category = item.article?.categorie_article?.nom || 
                        item.article?.categorie || 
                        'Général';
        return category === selectedCategory;
      });
    }

    console.log('Filtered products:', filtered.length, 'from', stockPDV.length);
    return filtered;
  }, [stockPDV, searchProduct, selectedCategory]);

  // Pagination
  const itemsPerPage = 12;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const totalFilteredPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const formatPrice = (price: number) => {
    return `${price?.toLocaleString()} GNF`;
  };

  if (loadingArticles) {
    return (
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Zone des produits */}
      <div className="flex-1 p-4 overflow-auto">
        {currentProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Package className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium mb-2">Aucun produit trouvé</p>
            <p className="text-sm text-center">
              {stockPDV?.length === 0 
                ? "Aucun stock disponible dans ce point de vente"
                : "Essayez de modifier vos critères de recherche"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentProducts.map((stockItem) => {
              const article = stockItem.article;
              const stock = stockItem.quantite_disponible || 0;
              const stockColor = getStockColor(stock);

              return (
                <Card 
                  key={stockItem.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => addToCart(article)}
                >
                  <CardContent className="p-3">
                    {/* Image du produit */}
                    <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {article?.image_url ? (
                        <img 
                          src={article.image_url} 
                          alt={article.nom}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* Info produit */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600">
                        {article?.nom || 'Produit sans nom'}
                      </h3>
                      
                      <p className="text-xs text-gray-500">
                        {article?.reference || 'Pas de référence'}
                      </p>

                      {/* Prix et stock */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600 text-sm">
                          {formatPrice(article?.prix_vente || 0)}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${stockColor}`}
                        >
                          {stock} en stock
                        </Badge>
                      </div>

                      {/* Bouton d'ajout */}
                      <Button 
                        size="sm" 
                        className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(article);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination si nécessaire */}
      {totalFilteredPages > 1 && (
        <div className="border-t p-4 bg-white">
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} sur {totalFilteredPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(Math.min(totalFilteredPages, currentPage + 1))}
              disabled={currentPage === totalFilteredPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
