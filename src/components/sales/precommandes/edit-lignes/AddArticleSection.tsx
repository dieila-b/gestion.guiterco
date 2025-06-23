
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import type { Article } from '@/hooks/useCatalogue';

interface AddArticleSectionProps {
  nouvelleArticle: string;
  setNouvelleArticle: (value: string) => void;
  articlesDisponibles: Article[];
  onAddArticle: () => void;
}

const AddArticleSection = ({
  nouvelleArticle,
  setNouvelleArticle,
  articlesDisponibles,
  onAddArticle
}: AddArticleSectionProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold mb-3">Ajouter un article</h3>
      <div className="flex gap-3">
        <Select value={nouvelleArticle} onValueChange={setNouvelleArticle}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Sélectionner un article" />
          </SelectTrigger>
          <SelectContent>
            {articlesDisponibles.map(article => (
              <SelectItem key={article.id} value={article.id}>
                {article.nom} - {formatCurrency(article.prix_vente || 0)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={onAddArticle} disabled={!nouvelleArticle}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>
    </div>
  );
};

export default AddArticleSection;
