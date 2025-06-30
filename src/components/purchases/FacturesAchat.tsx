
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { useFacturesAchat } from '@/hooks/useFacturesAchat';
import { useAllFactureAchatArticles } from '@/hooks/useFactureAchatArticles';
import { useAllBonCommandeArticles } from '@/hooks/useBonCommandeArticles';
import { useAllReglementsAchat } from '@/hooks/useReglementsAchat';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { EditFactureAchatDialog } from './EditFactureAchatDialog';
import { DeleteFactureAchatDialog } from './DeleteFactureAchatDialog';
import { PrintFactureAchatDialog } from './PrintFactureAchatDialog';

const FacturesAchat = () => {
  const { facturesAchat, isLoading } = useFacturesAchat();
  const { data: articlesCounts } = useAllFactureAchatArticles();
  const { data: bonCommandeArticlesCounts } = useAllBonCommandeArticles();
  const { data: reglementsAchat } = useAllReglementsAchat();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFactures = facturesAchat?.filter(facture => 
    facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facture.fournisseur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'paye': return 'bg-green-100 text-green-800 border-green-300';
      case 'partiellement_paye': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en_retard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'Non réglé';
      case 'paye': return 'Réglé';
      case 'partiellement_paye': return 'Partiel';
      case 'en_retard': return 'En retard';
      default: return statut;
    }
  };

  // Calculate derived values for each invoice
  const getArticleCount = (facture: any) => {
    // Priorité 1: Articles directement liés à la facture
    const directArticles = articlesCounts?.[facture.id] || 0;
    if (directArticles > 0) {
      return directArticles;
    }
    
    // Priorité 2: Articles du bon de commande lié (pour les factures auto-générées)
    if (facture.bon_commande_id) {
      const bonCommandeArticles = bonCommandeArticlesCounts?.[facture.bon_commande_id] || 0;
      return bonCommandeArticles;
    }
    
    return 0;
  };

  const getPaidAmount = (facture: any) => {
    // Calculer le montant total payé (acomptes + règlements)
    let totalPaid = 0;
    
    // Ajouter l'acompte du bon de commande si disponible
    if (facture.bon_commande?.montant_paye) {
      totalPaid += facture.bon_commande.montant_paye;
    }
    
    // Ajouter les règlements de la table reglements_achat
    if (reglementsAchat && reglementsAchat[facture.id]) {
      totalPaid += reglementsAchat[facture.id];
    }
    
    // Fallback: Ajouter les règlements depuis la relation (si disponible)
    if (facture.reglements && Array.isArray(facture.reglements)) {
      const reglementsTotal = facture.reglements.reduce((sum: number, reglement: any) => {
        return sum + (reglement.montant || 0);
      }, 0);
      totalPaid += reglementsTotal;
    }
    
    return totalPaid;
  };

  const getRemainingAmount = (facture: any) => {
    const paidAmount = getPaidAmount(facture);
    return Math.max(0, facture.montant_ttc - paidAmount);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">Factures d'achat</CardTitle>
            <p className="text-sm text-muted-foreground">Gérez vos factures d'achat fournisseurs</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2 mb-6">
            <Input
              placeholder="Filtrer ici"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button type="submit" size="icon" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">N° Facture</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Fournisseur</TableHead>
                  <TableHead className="font-semibold text-center">Articles</TableHead>
                  <TableHead className="font-semibold text-right">Payé</TableHead>
                  <TableHead className="font-semibold text-right">Reste</TableHead>
                  <TableHead className="font-semibold text-right">Montant</TableHead>
                  <TableHead className="font-semibold text-center">Statut</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFactures && filteredFactures.length > 0 ? (
                  filteredFactures.map((facture) => {
                    const articleCount = getArticleCount(facture);
                    const paidAmount = getPaidAmount(facture);
                    const remainingAmount = getRemainingAmount(facture);
                    
                    return (
                      <TableRow key={facture.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-blue-600">
                          {facture.numero_facture}
                        </TableCell>
                        <TableCell>
                          {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {facture.fournisseur}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium text-lg ${articleCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                            {articleCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          {formatCurrency(paidAmount)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-orange-600">
                          {formatCurrency(remainingAmount)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(facture.montant_ttc)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`${getStatusBadgeColor(facture.statut_paiement)} font-medium`}
                          >
                            {getStatusLabel(facture.statut_paiement)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-1">
                            <EditFactureAchatDialog facture={facture} />
                            <DeleteFactureAchatDialog 
                              factureId={facture.id} 
                              numeroFacture={facture.numero_facture} 
                            />
                            <PrintFactureAchatDialog facture={facture} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">
                        Aucune facture d'achat trouvée
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacturesAchat;
