
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, RefreshCw, CheckCircle, Eye } from 'lucide-react';
import { useBonsLivraison } from '@/hooks/useBonsLivraison';
import { useBonLivraisonArticles } from '@/hooks/useBonLivraisonArticles';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ApprovalDialog } from './ApprovalDialog';

const BonsLivraison = () => {
  const { bonsLivraison, isLoading } = useBonsLivraison();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBon, setSelectedBon] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApproval, setShowApproval] = useState(false);

  const filteredBons = bonsLivraison?.filter(bon => 
    bon.numero_bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.fournisseur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_transit': return 'bg-blue-100 text-blue-800';
      case 'livre': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_transit': return 'En transit';
      case 'livre': return 'Livré';
      case 'en_attente': return 'En attente';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  const handleApprove = (bon: any) => {
    setSelectedBon(bon);
    setShowApproval(true);
  };

  const handleViewDetails = (bon: any) => {
    setSelectedBon(bon);
    setShowDetails(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Bons de Livraison</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" title="Rafraîchir">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
            <Input
              placeholder="Rechercher un bon de livraison..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button type="submit" size="icon" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Chargement des bons de livraison...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Date livraison</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Transporteur</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBons && filteredBons.length > 0 ? (
                    filteredBons.map((bon) => (
                      <TableRow key={bon.id}>
                        <TableCell className="font-medium">{bon.numero_bon}</TableCell>
                        <TableCell>{bon.fournisseur}</TableCell>
                        <TableCell>
                          {format(new Date(bon.date_livraison), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(bon.statut)}>
                            {getStatusLabel(bon.statut)}
                          </Badge>
                        </TableCell>
                        <TableCell>{bon.transporteur || 'N/A'}</TableCell>
                        <TableCell>
                          {bon.entrepot_destination?.nom || bon.point_vente_destination?.nom || 'Non définie'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(bon)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {bon.statut === 'en_transit' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(bon)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Aucun bon de livraison trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'approbation */}
      <ApprovalDialog
        open={showApproval}
        onOpenChange={setShowApproval}
        bonLivraison={selectedBon}
        onApprove={() => {
          // Pas besoin de logique supplémentaire, le hook gère déjà le rafraîchissement
        }}
      />

      {/* Dialog de détails */}
      <BonLivraisonDetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        bonLivraison={selectedBon}
      />
    </div>
  );
};

// Composant pour afficher les détails d'un bon de livraison
const BonLivraisonDetailsDialog = ({ open, onOpenChange, bonLivraison }: any) => {
  const { data: articles } = useBonLivraisonArticles(bonLivraison?.id);

  if (!bonLivraison) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du bon de livraison {bonLivraison.numero_bon}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Fournisseur:</strong> {bonLivraison.fournisseur}</p>
              <p><strong>Date de livraison:</strong> {format(new Date(bonLivraison.date_livraison), 'dd/MM/yyyy', { locale: fr })}</p>
              <p><strong>Statut:</strong> {bonLivraison.statut}</p>
            </div>
            <div>
              <p><strong>Transporteur:</strong> {bonLivraison.transporteur || 'N/A'}</p>
              <p><strong>Numéro de suivi:</strong> {bonLivraison.numero_suivi || 'N/A'}</p>
              <p><strong>Destination:</strong> {bonLivraison.entrepot_destination?.nom || bonLivraison.point_vente_destination?.nom || 'Non définie'}</p>
            </div>
          </div>

          {articles && articles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Articles</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Quantité commandée</TableHead>
                    <TableHead>Quantité reçue</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>{article.catalogue?.nom || 'Article inconnu'}</TableCell>
                      <TableCell>{article.quantite_commandee}</TableCell>
                      <TableCell>{article.quantite_recue || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(article.prix_unitaire)}</TableCell>
                      <TableCell>{formatCurrency(article.montant_ligne)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {bonLivraison.observations && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Observations</h3>
              <p className="text-sm text-gray-600">{bonLivraison.observations}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BonsLivraison;
