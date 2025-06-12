
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, RefreshCw, CheckCircle, Edit } from 'lucide-react';
import { useBonsLivraison } from '@/hooks/useBonsLivraison';
import { useAllBonLivraisonArticles } from '@/hooks/useBonLivraisonArticles';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ApprovalDialog } from './ApprovalDialog';
import { PrintBonLivraisonDialog } from './PrintBonLivraisonDialog';
import { DeleteBonLivraisonDialog } from './DeleteBonLivraisonDialog';

const BonsLivraison = () => {
  const { bonsLivraison, isLoading } = useBonsLivraison();
  const { data: articlesCount } = useAllBonLivraisonArticles();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBon, setSelectedBon] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  const filteredBons = bonsLivraison?.filter(bon => 
    bon.numero_bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.bon_commande?.numero_bon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_transit': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'livre': 
      case 'receptionne': return 'bg-green-100 text-green-800 border-green-300';
      case 'en_attente': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'annule': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_transit': return 'En attente';
      case 'livre': 
      case 'receptionne': return 'Reçu';
      case 'en_attente': return 'En attente';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  const getArticleCount = (bonId: string) => {
    return articlesCount?.[bonId] || 0;
  };

  const calculateMontant = (bon: any) => {
    // Utiliser le montant du bon de commande lié si disponible
    if (bon.bon_commande?.montant_total) {
      return bon.bon_commande.montant_total;
    }
    return 0;
  };

  const handleViewDetails = (bon: any) => {
    setSelectedBon(bon);
    setShowDetails(true);
  };

  const handleApprove = (bon: any) => {
    setSelectedBon(bon);
    setShowApprovalDialog(true);
  };

  const isApproved = (statut: string) => {
    return statut === 'receptionne' || statut === 'livre';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">Bons de livraison</CardTitle>
            <p className="text-sm text-muted-foreground">Gérez vos bons de livraison fournisseurs</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" title="Rafraîchir">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2 mb-6">
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button type="submit" size="icon" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">Chargement des bons de livraison...</div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Numéro</TableHead>
                    <TableHead className="font-semibold">Bon de commande</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Fournisseur</TableHead>
                    <TableHead className="font-semibold text-center">Articles</TableHead>
                    <TableHead className="font-semibold text-center">Statut</TableHead>
                    <TableHead className="font-semibold text-right">Montant</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBons && filteredBons.length > 0 ? (
                    <>
                      <TableRow className="text-sm text-muted-foreground bg-blue-50/50">
                        <TableCell colSpan={8} className="py-2 px-4">
                          {filteredBons.length} bons de livraison trouvés
                        </TableCell>
                      </TableRow>
                      {filteredBons.map((bon) => (
                        <TableRow key={bon.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-blue-600">
                            {bon.numero_bon}
                          </TableCell>
                          <TableCell className="text-blue-600 underline cursor-pointer">
                            {bon.bon_commande?.numero_bon || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(bon.date_livraison), 'dd/MM/yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {bon.fournisseur}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium">
                              {getArticleCount(bon.id)} article{getArticleCount(bon.id) !== 1 ? 's' : ''}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant="outline" 
                              className={`${getStatusColor(bon.statut)} font-medium`}
                            >
                              {getStatusLabel(bon.statut)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(calculateMontant(bon))}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-1">
                              {/* Afficher tous les boutons sauf Approuver si le bon est déjà approuvé */}
                              {!isApproved(bon.statut) && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                                    onClick={() => handleViewDetails(bon)}
                                    title="Modifier"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white border-green-500"
                                    onClick={() => handleApprove(bon)}
                                    title="Approuver"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <DeleteBonLivraisonDialog bon={bon} />
                                </>
                              )}
                              {/* Le bouton Imprimer est toujours visible */}
                              <PrintBonLivraisonDialog bon={bon} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-muted-foreground">
                          Aucun bon de livraison trouvé
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du bon de livraison {selectedBon?.numero_bon}</DialogTitle>
          </DialogHeader>
          {selectedBon && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Fournisseur:</strong> {selectedBon.fournisseur}</p>
                  <p><strong>Date de livraison:</strong> {format(new Date(selectedBon.date_livraison), 'dd/MM/yyyy', { locale: fr })}</p>
                  <p><strong>Statut:</strong> {getStatusLabel(selectedBon.statut)}</p>
                </div>
                <div>
                  <p><strong>Bon de commande:</strong> {selectedBon.bon_commande?.numero_bon || 'N/A'}</p>
                  <p><strong>Transporteur:</strong> {selectedBon.transporteur || 'N/A'}</p>
                  <p><strong>Numéro de suivi:</strong> {selectedBon.numero_suivi || 'N/A'}</p>
                </div>
              </div>

              {selectedBon.observations && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Observations</h3>
                  <p className="text-sm text-gray-600">{selectedBon.observations}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'approbation */}
      <ApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        bonLivraison={selectedBon}
        onApprove={() => {
          setShowApprovalDialog(false);
          // Optionnel: rafraîchir la liste
        }}
      />
    </div>
  );
};

export default BonsLivraison;
