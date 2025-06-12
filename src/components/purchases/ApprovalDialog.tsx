
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useEntrepots, usePointsDeVente } from '@/hooks/useStock';
import { useBonLivraisonArticles } from '@/hooks/useBonLivraisonArticles';
import { formatCurrency } from '@/lib/currency';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bonLivraison: any;
  onApprove: (approvalData: {
    destinationType: 'entrepot' | 'point_vente';
    destinationId: string;
    articles: Array<{
      id: string;
      quantite_recue: number;
    }>;
  }) => void;
}

export const ApprovalDialog = ({ open, onOpenChange, bonLivraison, onApprove }: ApprovalDialogProps) => {
  const [destinationType, setDestinationType] = useState<'entrepot' | 'point_vente'>('entrepot');
  const [destinationId, setDestinationId] = useState('');
  const [articlesQuantites, setArticlesQuantites] = useState<Record<string, number>>({});
  
  const { data: entrepots } = useEntrepots();
  const { data: pointsDeVente } = usePointsDeVente();
  const { data: articles } = useBonLivraisonArticles(bonLivraison?.id);

  const handleQuantiteChange = (articleId: string, quantite: number) => {
    setArticlesQuantites(prev => ({
      ...prev,
      [articleId]: quantite
    }));
  };

  const handleApprove = () => {
    const approvalData = {
      destinationType,
      destinationId,
      articles: articles?.map(article => ({
        id: article.id,
        quantite_recue: articlesQuantites[article.id] || article.quantite_commandee
      })) || []
    };
    
    onApprove(approvalData);
    onOpenChange(false);
  };

  const isFormValid = destinationId && articles?.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Approuver le bon de livraison {bonLivraison?.numero_bon}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection de la destination */}
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Type de destination</Label>
              <Select value={destinationType} onValueChange={(value: 'entrepot' | 'point_vente') => setDestinationType(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="entrepot">Entrepôt</SelectItem>
                  <SelectItem value="point_vente">Point de vente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">
                {destinationType === 'entrepot' ? 'Entrepôt' : 'Point de vente'} de destination
              </Label>
              <Select value={destinationId} onValueChange={setDestinationId}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {destinationType === 'entrepot' 
                    ? entrepots?.map(entrepot => (
                        <SelectItem key={entrepot.id} value={entrepot.id}>
                          {entrepot.nom}
                        </SelectItem>
                      ))
                    : pointsDeVente?.map(pdv => (
                        <SelectItem key={pdv.id} value={pdv.id}>
                          {pdv.nom}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Liste des articles */}
          <div>
            <Label className="text-gray-300 text-lg font-semibold">Articles à réceptionner</Label>
            <div className="space-y-3 mt-3">
              {articles?.map(article => (
                <Card key={article.id} className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="col-span-2">
                        <p className="text-white font-medium">{article.article?.nom || 'Article inconnu'}</p>
                        <p className="text-gray-400 text-sm">Réf: {article.article?.reference || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-300 text-sm">Commandé</p>
                        <p className="text-white font-semibold">{article.quantite_commandee}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">Quantité reçue</Label>
                        <Input
                          type="number"
                          min="0"
                          max={article.quantite_commandee}
                          defaultValue={article.quantite_commandee}
                          onChange={(e) => handleQuantiteChange(article.id, parseInt(e.target.value) || 0)}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-gray-300 text-sm">Montant</p>
                        <p className="text-white font-semibold">
                          {formatCurrency(article.montant_ligne)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!isFormValid}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approuver et mettre à jour le stock
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
