
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { ArticleOptimized } from '@/hooks/useCatalogueOptimized';

interface ProductGridProps {
  articles: ArticleOptimized[];
  loadingArticles: boolean;
  addToCart: (article: any) => void;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  articles,
  loadingArticles,
  addToCart,
  currentPage,
  totalPages,
  goToPage
}) => {
  return (
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
  );
};

export default ProductGrid;
