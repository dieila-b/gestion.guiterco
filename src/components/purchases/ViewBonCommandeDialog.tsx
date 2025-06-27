
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/currency';
import { useBonCommandeArticles } from '@/hooks/useBonCommandeArticles';
import type { BonCommande } from '@/types/purchases';

interface ViewBonCommandeDialogProps {
  bonCommande: BonCommande;
  open: boolean;
  onClose: () => void;
}

export const ViewBonCommandeDialog = ({ bonCommande, open, onClose }: ViewBonCommandeDialogProps) => {
  const { data: articles, isLoading } = useBonCommandeArticles(bonCommande.id);

  const getStatutBadge = (statut: string) => {
    const variants = {
      'en_cours': 'secondary',
      'approuve': 'default',
      'livre': 'outline',
      'receptionne': 'outline',
      'annule': 'destructive'
    } as const;

    const labels = {
      'en_cours': 'En cours',
      'approuve': 'Approuvé',
      'livre': 'Livré',
      'receptionne': 'Réceptionné',
      'annule': 'Annulé'
    };

    return (
      <Badge variant={variants[statut as keyof typeof variants] || 'secondary'}>
        {labels[statut as keyof typeof labels] || statut}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du bon de commande {bonCommande.numero_bon}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Informations générales</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Numéro:</span>
                  <span className="ml-2 font-medium">{bonCommande.numero_bon}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Date de commande:</span>
                  <span className="ml-2">{formatDate(bonCommande.date_commande)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Fournisseur:</span>
                  <span className="ml-2">{bonCommande.fournisseur}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Statut:</span>
                  <span className="ml-2">{getStatutBadge(bonCommande.statut)}</span>
                </div>
                {bonCommande.date_livraison_prevue && (
                  <div>
                    <span className="text-sm text-gray-600">Livraison prévue:</span>
                    <span className="ml-2">{formatDate(bonCommande.date_livraison_prevue)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Montants</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Montant HT:</span>
                  <span className="ml-2">{formatCurrency(bonCommande.montant_ht)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">TVA:</span>
                  <span className="ml-2">{formatCurrency(bonCommande.tva || 0)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 font-semibold">Total:</span>
                  <span className="ml-2 font-semibold">{formatCurrency(bonCommande.montant_total)}</span>
                </div>
                {bonCommande.montant_paye && bonCommande.montant_paye > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Montant payé:</span>
                    <span className="ml-2">{formatCurrency(bonCommande.montant_paye)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Articles */}
          <div>
            <h3 className="font-semibold mb-4">Articles commandés</h3>
            {isLoading ? (
              <div className="text-center py-4">Chargement des articles...</div>
            ) : articles && articles.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">Article</th>
                      <th className="px-4 py-2 text-center text-sm font-medium">Quantité</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Prix unitaire</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Total ligne</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {articles.map((article, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium">{article.catalogue?.nom || 'Article inconnu'}</div>
                            {article.catalogue?.reference && (
                              <div className="text-sm text-gray-500">Réf: {article.catalogue.reference}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">{article.quantite}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(Number(article.prix_unitaire))}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(Number(article.montant_ligne))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">Aucun article trouvé</div>
            )}
          </div>

          {/* Frais additionnels */}
          {(bonCommande.remise || bonCommande.frais_livraison || bonCommande.frais_logistique || bonCommande.transit_douane) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-4">Frais additionnels</h3>
                <div className="grid grid-cols-2 gap-4">
                  {bonCommande.remise && bonCommande.remise > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Remise:</span>
                      <span className="ml-2">{formatCurrency(bonCommande.remise)}</span>
                    </div>
                  )}
                  {bonCommande.frais_livraison && bonCommande.frais_livraison > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Frais de livraison:</span>
                      <span className="ml-2">{formatCurrency(bonCommande.frais_livraison)}</span>
                    </div>
                  )}
                  {bonCommande.frais_logistique && bonCommande.frais_logistique > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Frais logistique:</span>
                      <span className="ml-2">{formatCurrency(bonCommande.frais_logistique)}</span>
                    </div>
                  )}
                  {bonCommande.transit_douane && bonCommande.transit_douane > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Transit & Douane:</span>
                      <span className="ml-2">{formatCurrency(bonCommande.transit_douane)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Observations */}
          {bonCommande.observations && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Observations</h3>
                <p className="text-sm bg-gray-50 p-3 rounded">{bonCommande.observations}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
