
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEntrepots, usePointsDeVente } from '@/hooks/stock';
import { useBonLivraisonArticles } from '@/hooks/useBonLivraisonArticles';
import { useBonLivraisonApproval } from '@/hooks/useBonLivraisonApproval';
import { formatCurrency } from '@/lib/currency';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface MultipleDestinationApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bonLivraison: any;
  onApprove?: () => void;
}

interface DestinationConfig {
  id: string;
  type: 'entrepot' | 'point_vente';
  destinationId: string;
  articles: Record<string, number>;
}

export const MultipleDestinationApprovalDialog = ({ 
  open, 
  onOpenChange, 
  bonLivraison, 
  onApprove 
}: MultipleDestinationApprovalDialogProps) => {
  const [useMultipleDestinations, setUseMultipleDestinations] = useState(false);
  const [destinations, setDestinations] = useState<DestinationConfig[]>([
    {
      id: '1',
      type: 'entrepot',
      destinationId: '',
      articles: {}
    }
  ]);
  
  const { entrepots } = useEntrepots();
  const { pointsDeVente } = usePointsDeVente();
  const { data: articles } = useBonLivraisonArticles(bonLivraison?.id);
  const { approveBonLivraison, isApproving } = useBonLivraisonApproval();

  const addDestination = () => {
    const newDestination: DestinationConfig = {
      id: Date.now().toString(),
      type: 'entrepot',
      destinationId: '',
      articles: {}
    };
    setDestinations([...destinations, newDestination]);
  };

  const removeDestination = (destinationId: string) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter(d => d.id !== destinationId));
    }
  };

  const updateDestination = (destinationId: string, field: keyof DestinationConfig, value: any) => {
    setDestinations(destinations.map(d => 
      d.id === destinationId ? { ...d, [field]: value } : d
    ));
  };

  const updateArticleQuantity = (destinationId: string, articleId: string, quantity: number) => {
    setDestinations(destinations.map(d => 
      d.id === destinationId 
        ? { ...d, articles: { ...d.articles, [articleId]: quantity } }
        : d
    ));
  };

  const getTotalQuantityForArticle = (articleId: string) => {
    return destinations.reduce((total, dest) => total + (dest.articles[articleId] || 0), 0);
  };

  const getAvailableQuantityForArticle = (articleId: string) => {
    const article = articles?.find(a => a.id === articleId);
    const totalAllocated = getTotalQuantityForArticle(articleId);
    return (article?.quantite_commandee || 0) - totalAllocated;
  };

  const handleApprove = async () => {
    if (!bonLivraison?.id || !articles?.length) return;

    try {
      if (useMultipleDestinations) {
        // Traitement pour destinations multiples
        for (const destination of destinations) {
          if (destination.destinationId) {
            const destArticles = Object.entries(destination.articles)
              .filter(([_, qty]) => qty > 0)
              .map(([articleId, qty]) => ({
                id: articleId,
                quantite_recue: qty
              }));

            if (destArticles.length > 0) {
              const approvalData = {
                destinationType: destination.type,
                destinationId: destination.destinationId,
                articles: destArticles
              };
              
              await approveBonLivraison.mutateAsync({
                bonLivraisonId: bonLivraison.id,
                approvalData
              });
            }
          }
        }
      } else {
        // Traitement pour destination unique (mode actuel)
        const singleDest = destinations[0];
        if (singleDest.destinationId) {
          const approvalData = {
            destinationType: singleDest.type,
            destinationId: singleDest.destinationId,
            articles: articles.map(article => ({
              id: article.id,
              quantite_recue: singleDest.articles[article.id] || article.quantite_commandee
            }))
          };
          
          await approveBonLivraison.mutateAsync({
            bonLivraisonId: bonLivraison.id,
            approvalData
          });
        }
      }
      
      onOpenChange(false);
      if (onApprove) onApprove();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const isFormValid = destinations.every(dest => dest.destinationId) && !isApproving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Approuver le bon de livraison {bonLivraison?.numero_bon}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Option destinations multiples */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Configuration des destinations</CardTitle>
                <div className="flex items-center space-x-2">
                  <Label className="text-gray-300">Destinations multiples</Label>
                  <Switch
                    checked={useMultipleDestinations}
                    onCheckedChange={setUseMultipleDestinations}
                    disabled={isApproving}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Configuration des destinations */}
          <div className="space-y-4">
            {destinations.map((destination, index) => (
              <Card key={destination.id} className="bg-gray-700 border-gray-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      Destination {index + 1}
                    </CardTitle>
                    {useMultipleDestinations && destinations.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeDestination(destination.id)}
                        disabled={isApproving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Type de destination</Label>
                      <Select 
                        value={destination.type} 
                        onValueChange={(value: 'entrepot' | 'point_vente') => 
                          updateDestination(destination.id, 'type', value)
                        }
                        disabled={isApproving}
                      >
                        <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
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
                        {destination.type === 'entrepot' ? 'Entrepôt' : 'Point de vente'}
                      </Label>
                      <Select 
                        value={destination.destinationId} 
                        onValueChange={(value) => 
                          updateDestination(destination.id, 'destinationId', value)
                        }
                        disabled={isApproving}
                      >
                        <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {destination.type === 'entrepot' 
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

                  {/* Répartition des articles pour cette destination */}
                  {useMultipleDestinations && (
                    <div>
                      <Label className="text-gray-300 text-sm font-semibold">
                        Répartition des articles
                      </Label>
                      <div className="space-y-2 mt-2">
                        {articles?.map(article => (
                          <div key={article.id} className="flex items-center justify-between bg-gray-600 p-3 rounded">
                            <div className="flex-1">
                              <p className="text-white text-sm">{article.catalogue?.nom}</p>
                              <p className="text-gray-400 text-xs">
                                Disponible: {getAvailableQuantityForArticle(article.id)} / {article.quantite_commandee}
                              </p>
                            </div>
                            <div className="w-24">
                              <Input
                                type="number"
                                min="0"
                                max={getAvailableQuantityForArticle(article.id) + (destination.articles[article.id] || 0)}
                                value={destination.articles[article.id] || 0}
                                onChange={(e) => updateArticleQuantity(
                                  destination.id, 
                                  article.id, 
                                  parseInt(e.target.value) || 0
                                )}
                                className="bg-gray-500 border-gray-400 text-white text-sm"
                                disabled={isApproving}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {useMultipleDestinations && (
              <Button
                variant="outline"
                onClick={addDestination}
                disabled={isApproving}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une destination
              </Button>
            )}
          </div>

          {/* Liste des articles (mode simple uniquement) */}
          {!useMultipleDestinations && (
            <div>
              <Label className="text-gray-300 text-lg font-semibold">Articles à réceptionner</Label>
              <div className="space-y-3 mt-3">
                {articles?.map(article => (
                  <Card key={article.id} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="col-span-2">
                          <p className="text-white font-medium">{article.catalogue?.nom || 'Article inconnu'}</p>
                          <p className="text-gray-400 text-sm">Réf: {article.catalogue?.reference || 'N/A'}</p>
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
                            value={destinations[0]?.articles[article.id] || article.quantite_commandee}
                            onChange={(e) => updateArticleQuantity(
                              destinations[0].id, 
                              article.id, 
                              parseInt(e.target.value) || 0
                            )}
                            className="bg-gray-600 border-gray-500 text-white"
                            disabled={isApproving}
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
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
