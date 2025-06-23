
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import type { LignePrecommandeComplete } from '@/types/precommandes';
import type { Article } from '@/hooks/useCatalogue';
import { formatCurrency } from '@/lib/currency';

interface ArticlesSectionProps {
  lignes: LignePrecommandeComplete[];
  articles?: Article[];
  onLigneChange: (index: number, field: string, value: any) => void;
  onDeleteLigne: (index: number) => void;
  onAddLigne: () => void;
}

export const ArticlesSection = ({
  lignes,
  articles,
  onLigneChange,
  onDeleteLigne,
  onAddLigne
}: ArticlesSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Articles de la précommande</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAddLigne}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un article
        </Button>
      </div>

      <div className="space-y-3">
        {lignes.map((ligne, index) => (
          <div key={ligne.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded">
            <div className="col-span-3">
              <Select 
                value={ligne.article_id} 
                onValueChange={(value) => {
                  const article = articles?.find(a => a.id === value);
                  if (article) {
                    onLigneChange(index, 'article_id', value);
                    onLigneChange(index, 'prix_unitaire', article.prix_vente || 0);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un article" />
                </SelectTrigger>
                <SelectContent>
                  {articles?.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Input
                type="number"
                min="1"
                value={ligne.quantite}
                onChange={(e) => onLigneChange(index, 'quantite', parseInt(e.target.value) || 1)}
                placeholder="Qté cmd"
                title="Quantité commandée"
              />
            </div>
            
            <div className="col-span-2">
              <Input
                type="number"
                min="0"
                max={ligne.quantite}
                value={ligne.quantite_livree || 0}
                onChange={(e) => onLigneChange(index, 'quantite_livree', parseInt(e.target.value) || 0)}
                placeholder="Qté livrée"
                title="Quantité livrée"
              />
            </div>
            
            <div className="col-span-2">
              <Input
                type="number"
                step="0.01"
                value={ligne.prix_unitaire}
                onChange={(e) => onLigneChange(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                placeholder="Prix unitaire"
              />
            </div>
            
            <div className="col-span-2 text-right text-sm font-medium">
              {formatCurrency(ligne.montant_ligne)}
            </div>
            
            <div className="col-span-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDeleteLigne(index)}
                className="text-red-600 hover:text-red-700"
                title="Supprimer cette ligne"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
