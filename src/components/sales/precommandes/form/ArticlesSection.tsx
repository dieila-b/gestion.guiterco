
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, AlertTriangle, Package } from 'lucide-react';
import type { LignePrecommandeComplete } from '@/types/precommandes';
import type { Article } from '@/hooks/useCatalogue';
import { formatCurrency } from '@/lib/currency';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Articles de la précommande
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={onAddLigne}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un article
        </Button>
      </div>

      <Alert className="bg-orange-50 border-orange-200">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Important :</strong> La saisie de la quantité livrée déduira automatiquement le stock de l'entrepôt ou du point de vente.
          <br />
          <strong>Seule la différence</strong> avec la quantité précédemment livrée sera déduite du stock.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded text-sm font-medium">
          <div className="col-span-3">Article</div>
          <div className="col-span-2">Qté commandée</div>
          <div className="col-span-2">Qté livrée</div>
          <div className="col-span-1">Reste</div>
          <div className="col-span-2">Prix unitaire</div>
          <div className="col-span-1 text-right">Montant</div>
          <div className="col-span-1">Actions</div>
        </div>
        
        {lignes.map((ligne, index) => {
          const quantiteLivreeCumulee = ligne.quantite_livree || 0;
          const quantiteRestante = ligne.quantite - quantiteLivreeCumulee;
          const isCompletelyDelivered = quantiteRestante <= 0;
          
          return (
            <div key={ligne.id} className={`grid grid-cols-12 gap-2 items-center p-3 border rounded-lg ${
              isCompletelyDelivered ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}>
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
                  <SelectTrigger className="text-sm">
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
                  placeholder="Qté"
                  className="text-sm"
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  max={ligne.quantite}
                  value={quantiteLivreeCumulee}
                  onChange={(e) => onLigneChange(index, 'quantite_livree', parseInt(e.target.value) || 0)}
                  placeholder="Qté livrée"
                  className={`text-sm border-orange-300 focus:border-orange-500 bg-orange-50 ${
                    isCompletelyDelivered ? 'bg-green-100 border-green-300' : ''
                  }`}
                  title="Quantité livrée cumulée - Seule la différence sera déduite du stock"
                />
              </div>

              <div className="col-span-1">
                <div className={`text-xs font-medium p-2 rounded text-center ${
                  quantiteRestante === 0 ? 'bg-green-100 text-green-700' : 
                  quantiteRestante < ligne.quantite ? 'bg-blue-100 text-blue-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {quantiteRestante}
                </div>
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  value={ligne.prix_unitaire}
                  onChange={(e) => onLigneChange(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                  placeholder="Prix"
                  className="text-sm"
                />
              </div>
              
              <div className="col-span-1 text-right text-sm font-medium">
                {formatCurrency(ligne.montant_ligne)}
              </div>
              
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteLigne(index)}
                  className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
                  title="Supprimer cette ligne"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {lignes.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Aucun article ajouté à cette précommande</p>
          <p className="text-sm mb-4">Commencez par ajouter un article pour continuer</p>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onAddLigne}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter le premier article
          </Button>
        </div>
      )}
    </div>
  );
};
