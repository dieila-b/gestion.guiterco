
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
            <TableHead>Statut</TableHead>
            <TableHead>Livraison</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacturesImpayeesTable;
