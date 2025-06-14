
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Article } from '@/components/stock/types';

interface ArticleSectionProps {
  articleId: string;
  articles?: Article[];
  onArticleChange: (value: string) => void;
}

export const ArticleSection = ({ articleId, articles, onArticleChange }: ArticleSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="article_id">Article *</Label>
      <Select value={articleId} onValueChange={onArticleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner..." />
        </SelectTrigger>
        <SelectContent>
          {articles?.map(article => (
            <SelectItem key={article.id} value={article.id}>
              {article.reference} - {article.nom}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
