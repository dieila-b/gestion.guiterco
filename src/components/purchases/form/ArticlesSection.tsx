
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArticleSelector } from '../ArticleSelector';
import { formatCurrency } from '@/lib/currency';
import { ArticleOptimized } from '@/hooks/useCatalogue';

interface ArticleLigne {
  article_id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
}

interface ArticlesSectionProps {
  articles: ArticleOptimized[] | undefined;
  loadingArticles: boolean;
  articlesLignes: ArticleLigne[];
  onAjouterArticle: (article: ArticleOptimized) => void;
  onModifierQuantite: (index: number, quantite: number) => void;
  onModifierPrix: (index: number, prix: number) => void;
  onSupprimerArticle: (index: number) => void;
}

export const ArticlesSection = ({
  articles,
  loadingArticles,
  articlesLignes,
  onAjouterArticle,
  onModifierQuantite,
  onModifierPrix,
  onSupprimerArticle
}: ArticlesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Articles</CardTitle>
      </CardHeader>
      <CardContent>
        <ArticleSelector
          articles={articles || []}
          onAjouterArticle={onAjouterArticle}
          isLoading={loadingArticles}
        />
        
        {articlesLignes.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-6 gap-2 font-medium text-sm">
              <div>Produit</div>
              <div>Quantité</div>
              <div>Prix unitaire (GNF)</div>
              <div>Montant (GNF)</div>
              <div></div>
            </div>
            {articlesLignes.map((article, index) => (
              <div key={index} className="grid grid-cols-6 gap-2 items-center">
                <div className="text-sm">{article.nom}</div>
                <Input
                  type="number"
                  min="1"
                  value={article.quantite}
                  onChange={(e) => onModifierQuantite(index, parseInt(e.target.value) || 1)}
                  className="h-8"
                />
                <Input
                  type="number"
                  step="1"
                  value={article.prix_unitaire}
                  onChange={(e) => onModifierPrix(index, parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
                <div className="text-sm font-medium">{formatCurrency(article.montant_ligne)}</div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onSupprimerArticle(index)}
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
