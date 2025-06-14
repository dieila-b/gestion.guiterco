
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGridProps {
  stockPDV: any[];
  loadingArticles: boolean;
  addToCart: (product: any) => void;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  getStockColor: (stock: number) => string;
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
  searchProduct,
  selectedCategory
}) => {
  if (loadingArticles) {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[...Array(12)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Filtrer les produits selon la recherche et la catégorie
  const filteredProducts = stockPDV?.filter((stockItem) => {
    const article = stockItem.article;
    if (!article) return false;

    const matchesSearch = !searchProduct || 
      article.nom?.toLowerCase().includes(searchProduct.toLowerCase()) ||
      article.reference?.toLowerCase().includes(searchProduct.toLowerCase());

    const matchesCategory = selectedCategory === 'Tous' || 
      article.categorie === selectedCategory;

    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* En-tête avec résultats */}
      <div className="p-4 lg:p-6 border-b bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Produits disponibles</h2>
            <p className="text-sm text-gray-600">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
              {searchProduct && ` pour "${searchProduct}"`}
              {selectedCategory !== 'Tous' && ` dans "${selectedCategory}"`}
            </p>
          </div>
          
          {/* Pagination compacte pour mobile */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-600 px-2">
                {currentPage} / {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Grille de produits responsive */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
            <p className="text-center">
              {searchProduct || selectedCategory !== 'Tous'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucun produit disponible dans ce point de vente'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {filteredProducts.map((stockItem) => {
              const article = stockItem.article;
              const stock = stockItem.quantite_disponible || 0;
              const stockColor = getStockColor(stock);

              return (
                <Card key={article.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    {/* Image du produit */}
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.nom}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                          📦
                        </div>
                      )}
                    </div>

                    {/* Informations produit */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.nom}
                      </h3>
                      
                      <div className="text-xs text-gray-500">
                        REF: {article.reference}
                      </div>

                      {/* Prix */}
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(article.prix_vente || 0)}
                      </div>

                      {/* Stock */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${stockColor}`}>
                          Stock: {stock}
                        </span>
                        
                        {article.categorie && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {article.categorie}
                          </span>
                        )}
                      </div>

                      {/* Bouton d'ajout */}
                      <Button
                        className="w-full mt-3 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                        variant="outline"
                        size="sm"
                        onClick={() => addToCart(article)}
                        disabled={stock <= 0}
                      >
                        {stock <= 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination en bas pour desktop */}
      {totalPages > 1 && (
        <div className="hidden lg:flex items-center justify-center gap-2 p-4 border-t bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={currentPage <= 1}
          >
            Premier
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage >= totalPages}
          >
            Dernier
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
