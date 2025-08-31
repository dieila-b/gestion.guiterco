
import React from 'react';
import { Button } from '@/components/ui/button';
import { Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface Article {
  id: string;
  nom: string;
  reference: string;
  prix_vente?: number;
  image_url?: string;
  categorie?: string;
}

interface ProductGridProps {
  stockPDV?: any[];
  loadingArticles: boolean;
  addToCart: (article: any) => void;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  getStockColor: (quantite: number) => string;
  getLocalStock?: (articleId: string) => number;
  searchProduct: string;
  selectedCategory: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  stockPDV = [], // Valeur par défaut pour éviter undefined
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

  // Vérification de sécurité pour s'assurer que stockPDV est un tableau
  const safeStockPDV = Array.isArray(stockPDV) ? stockPDV : [];

  // Filtrer les produits en fonction de la recherche et de la catégorie
  const filteredProducts = React.useMemo(() => {
    if (!Array.isArray(safeStockPDV) || safeStockPDV.length === 0) {
      return [];
    }
    
    const filtered = safeStockPDV.filter(stockItem => {
      const article = stockItem?.article;
      if (!article) return false;

      // Filtre par recherche
      const matchesSearch = !searchProduct || 
        (article.nom && article.nom.toLowerCase().includes(searchProduct.toLowerCase())) ||
        (article.reference && article.reference.toLowerCase().includes(searchProduct.toLowerCase()));

      // Filtre par catégorie - utiliser la catégorie normalisée
      const articleCategory = article.categorie || '';
      const matchesCategory = selectedCategory === 'Tous' || 
        !selectedCategory || 
        selectedCategory === '' ||
        articleCategory === selectedCategory;

      console.log('Filtering article:', {
        nom: article.nom,
        categorie: articleCategory,
        selectedCategory,
        matchesCategory,
        matchesSearch
      });

      return matchesSearch && matchesCategory;
    });

    console.log('Filtered products:', filtered.length, 'from', safeStockPDV.length);
    return filtered;
  }, [safeStockPDV, searchProduct, selectedCategory]);

  const getStockIndicator = (quantite: number) => {
    if (quantite > 50) return { emoji: '🟢', text: 'En stock' };
    if (quantite >= 10) return { emoji: '🟠', text: 'Stock moyen' };
    return { emoji: '🔴', text: 'Stock faible' };
  };

  const getDisplayStock = (stockItem: any) => {
    if (!stockItem) return 0;
    
    // Utiliser le stock local si disponible, sinon le stock PDV
    if (getLocalStock && stockItem.article_id) {
      return getLocalStock(stockItem.article_id);
    }
    return stockItem.quantite_disponible || 0;
  };

  return (
    <div className="w-1/2 p-4 flex flex-col">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-full">
        {/* En-tête produits */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Produits disponibles</h3>
          <p className="text-sm text-gray-500">
            {filteredProducts.length} produits trouvés - Stock mis à jour en temps réel
            {selectedCategory && selectedCategory !== 'Tous' && (
              <span className="ml-2 text-blue-600 font-medium">
                Catégorie: {selectedCategory}
              </span>
            )}
          </p>
        </div>

        {/* Grille des produits */}
        <div className="flex-1 overflow-auto p-4">
          {loadingArticles ? (
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : !Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun produit trouvé</p>
              <p className="text-sm">
                {selectedCategory && selectedCategory !== 'Tous' 
                  ? `Aucun produit dans la catégorie "${selectedCategory}"`
                  : 'Essayez de changer les filtres ou sélectionner un autre PDV'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 mb-4">
                {filteredProducts.map((stockItem) => {
                  if (!stockItem || !stockItem.article) {
                    return null;
                  }
                  
                  const article = stockItem.article;
                  const stockDisponible = getDisplayStock(stockItem);
                  const stockIndicator = getStockIndicator(stockDisponible);
                  
                  return (
                    <div 
                      key={article.id}
                      className={`border rounded-lg p-3 transition-all cursor-pointer hover:shadow-md bg-background relative ${
                        stockDisponible === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'
                      }`}
                      onClick={() => stockDisponible > 0 && addToCart(article)}
                    >
                      {/* Indicateur de stock */}
                      <div className="absolute top-2 right-2 text-lg">
                        {stockIndicator.emoji}
                      </div>
                      
                      <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                        {article.image_url ? (
                          <img 
                            src={article.image_url} 
                            alt={article.nom || 'Article'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <Image className="h-8 w-8 text-blue-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm font-medium truncate mb-2" title={article.nom || ''}>
                        {article.nom || 'Nom non disponible'}
                      </div>
                      
                      {/* Affichage de la catégorie pour debug */}
                      {article.categorie && (
                        <div className="text-xs text-gray-400 mb-1">
                          {article.categorie}
                        </div>
                      )}
                      
                      {/* Stock disponible avec couleur et indication temps réel */}
                      <div className={`text-xs font-medium mb-1 ${getStockColor(stockDisponible)}`}>
                        Stock: {stockDisponible}
                        {getLocalStock && (
                          <span className="ml-1 text-blue-500 animate-pulse">●</span>
                        )}
                      </div>
                      
                      <div className="font-bold text-blue-600">
                        {formatCurrency(article.prix_vente || 0)}
                      </div>
                      
                      {stockDisponible === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">RUPTURE</span>
                        </div>
                      )}
                    </div>
                  );
                }).filter(Boolean)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
