
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useEntrepots, usePointsDeVente } from '@/hooks/stock';
import { useBonLivraisonArticles } from '@/hooks/useBonLivraisonArticles';
import { useBonLivraisonApproval } from '@/hooks/useBonLivraisonApproval';
import { formatCurrency } from '@/lib/currency';
import { Loader2 } from 'lucide-react';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bonLivraison: any;
  onApprove?: () => void;
}

export const ApprovalDialog = ({ open, onOpenChange, bonLivraison, onApprove }: ApprovalDialogProps) => {
  const [destinationType, setDestinationType] = useState<'entrepot' | 'point_vente'>('entrepot');
  const [destinationId, setDestinationId] = useState('');
  const [articlesQuantites, setArticlesQuantites] = useState<Record<string, number>>({});
  
  const { entrepots } = useEntrepots();
  const { pointsDeVente } = usePointsDeVente();
  const { data: articles } = useBonLivraisonArticles(bonLivraison?.id);
  const { approveBonLivraison, isApproving } = useBonLivraisonApproval();

  const handleQuantiteChange = (articleId: string, quantite: number) => {
    setArticlesQuantites(prev => ({
      ...prev,
      [articleId]: quantite
    }));
  };

  const handleApprove = async () => {
    if (!bonLivraison?.id || !destinationId || !articles?.length) {
      return;
    }

    const approvalData = {
      destinationType,
      destinationId,
      articles: articles.map(article => ({
        id: article.id,
        quantite_recue: articlesQuantites[article.id] || article.quantite_commandee
      }))
    };
    
    try {
      await approveBonLivraison.mutateAsync({
        bonLivraisonId: bonLivraison.id,
        approvalData
      });
      
      // Réinitialiser le formulaire
      setDestinationId('');
      setArticlesQuantites({});
      onOpenChange(false);
      
      // Appeler le callback si fourni
      if (onApprove) {
        onApprove();
      }
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const isFormValid = destinationId && articles?.length > 0 && !isApproving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            Approuver le bon de livraison {bonLivraison?.numero_bon}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection de la destination */}
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 font-medium">Type de destination</Label>
              <Select 
                value={destinationType} 
                onValueChange={(value: 'entrepot' | 'point_vente') => setDestinationType(value)}
                disabled={isApproving}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="entrepot" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50">
                    Entrepôt
                  </SelectItem>
                  <SelectItem value="point_vente" className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50">
                    Point de vente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 font-medium">
                {destinationType === 'entrepot' ? 'Entrepôt' : 'Point de vente'} de destination
              </Label>
              <Select 
                value={destinationId} 
                onValueChange={setDestinationId}
                disabled={isApproving}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  {destinationType === 'entrepot' 
                    ? entrepots?.map(entrepot => (
                        <SelectItem 
                          key={entrepot.id} 
                          value={entrepot.id}
                          className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50"
                        >
                          {entrepot.nom}
                        </SelectItem>
                      ))
                    : pointsDeVente?.map(pdv => (
                        <SelectItem 
                          key={pdv.id} 
                          value={pdv.id}
                          className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50"
                        >
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
            <Label className="text-gray-900 text-lg font-semibold">Articles à réceptionner</Label>
            <div className="space-y-3 mt-3">
              {articles?.map(article => (
                <Card key={article.id} className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="col-span-2">
                        <p className="text-gray-900 font-medium">{article.catalogue?.nom || 'Article inconnu'}</p>
                        <p className="text-gray-600 text-sm">Réf: {article.catalogue?.reference || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 text-sm">Commandé</p>
                        <p className="text-gray-900 font-semibold">{article.quantite_commandee}</p>
                      </div>
                      <div>
                        <Label className="text-gray-700 text-sm">Quantité reçue</Label>
                        <Input
                          type="number"
                          min="0"
                          max={article.quantite_commandee}
                          defaultValue={article.quantite_commandee}
                          onChange={(e) => handleQuantiteChange(article.id, parseInt(e.target.value) || 0)}
                          className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                          disabled={isApproving}
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-gray-700 text-sm">Montant</p>
                        <p className="text-gray-900 font-semibold">
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
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              disabled={isApproving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!isFormValid}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approbation en cours...
                </>
              ) : (
                'Approuver et mettre à jour le stock'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
