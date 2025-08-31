
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { Article } from '@/hooks/useCatalogue';
import { formatCurrency } from '@/lib/currency';

interface ArticleSelectorProps {
  articles: Article[];
  onAjouterArticle: (article: Article) => void;
  isLoading: boolean;
}

export const ArticleSelector = ({ articles, onAjouterArticle, isLoading }: ArticleSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');

  const articlesFiltres = articles.filter(article =>
    article.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAjouter = () => {
    const article = articles.find(a => a.id === selectedArticleId);
    if (article) {
      onAjouterArticle(article);
      setSelectedArticleId('');
    }
  };

  if (isLoading) {
    return <div>Chargement des articles...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Select value={selectedArticleId} onValueChange={setSelectedArticleId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Sélectionnez un article à ajouter" />
          </SelectTrigger>
          <SelectContent>
            {articlesFiltres.map((article) => (
              <SelectItem key={article.id} value={article.id}>
                <div className="flex justify-between items-center w-full">
                  <span>{article.nom}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {article.prix_achat ? formatCurrency(article.prix_achat) : 'Prix non défini'}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={handleAjouter}
          disabled={!selectedArticleId}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
