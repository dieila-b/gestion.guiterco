
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Printer, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EditFactureDialog from './actions/EditFactureDialog';
import { printFactureVente, printTicket } from './actions/print';
import type { FactureImpayee } from '@/hooks/sales/queries/useFacturesImpayeesQuery';

interface FacturesImpayeesTableProps {
  factures: FactureImpayee[];
  isLoading: boolean;
}

const FacturesImpayeesTable: React.FC<FacturesImpayeesTableProps> = ({
  factures,
  isLoading
}) => {
  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'destructive';
      case 'partiellement_payee': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'partiellement_payee': return 'Partiellement payée';
      default: return statut;
    }
  };

  const handlePrintFacture = (facture: FactureImpayee) => {
    // Convertir la structure pour l'impression
    const factureForPrint = {
      id: facture.facture_id,
      numero_facture: facture.numero_facture,
      date_facture: facture.date_facture,
      client: { nom: facture.client },
      montant_ttc: facture.total,
      statut_paiement: facture.statut_paiement,
      statut_livraison: facture.statut_livraison
    };
    printFactureVente(factureForPrint as any);
  };

  const handlePrintTicket = (facture: FactureImpayee) => {
    // Convertir la structure pour l'impression
    const factureForPrint = {
      id: facture.facture_id,
      numero_facture: facture.numero_facture,
      date_facture: facture.date_facture,
      client: { nom: facture.client },
      montant_ttc: facture.total,
      statut_paiement: facture.statut_paiement,
      statut_livraison: facture.statut_livraison
    };
    printTicket(factureForPrint as any);
  };

  // Calculer le total des restants
  const totalRestant = factures.reduce((sum, facture) => sum + facture.restant, 0);

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  if (!factures || factures.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune facture impayée trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total des restants dûs */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-red-800 font-medium">Total restant dû :</span>
          <span className="text-red-900 font-bold text-lg">
            {formatCurrency(totalRestant)}
          </span>
        </div>
      </div>

      {/* Tableau des factures */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead className="text-right">Restant</TableHead>
              <TableHead>Statut Paiement</TableHead>
              <TableHead>Statut Livraison</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factures.map((facture) => (
              <TableRow key={facture.facture_id}>
                <TableCell className="font-medium">
                  {facture.numero_facture}
                </TableCell>
                <TableCell>
                  {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell>{facture.client}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(facture.total)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(facture.paye)}
                </TableCell>
                <TableCell className="text-right font-semibold text-red-600">
                  {formatCurrency(facture.restant)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeColor(facture.statut_paiement) as any}>
                    {getStatusLabel(facture.statut_paiement)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {facture.statut_livraison}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-center">
                    {/* Bouton Éditer */}
                    <EditFactureDialog 
                      facture={{
                        id: facture.facture_id,
                        numero_facture: facture.numero_facture,
                        date_facture: facture.date_facture,
                        client: { nom: facture.client },
                        montant_ttc: facture.total,
                        statut_paiement: facture.statut_paiement,
                        statut_livraison: facture.statut_livraison,
                        versements: []
                      } as any}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-orange-600 hover:text-orange-800 p-1"
                        title="Éditer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </EditFactureDialog>
                    
                    {/* Bouton Imprimer */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handlePrintFacture(facture)}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Imprimer la facture"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    
                    {/* Bouton Reçu */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handlePrintTicket(facture)}
                      className="text-purple-600 hover:text-purple-800 p-1"
                      title="Imprimer le reçu"
                    >
                      <Receipt className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FacturesImpayeesTable;
