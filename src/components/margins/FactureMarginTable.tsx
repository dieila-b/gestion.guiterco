
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FactureWithMargin } from '@/types/margins';

interface FactureMarginTableProps {
  factures: FactureWithMargin[];
  isLoading: boolean;
}

const FactureMarginTable = ({ factures, isLoading }: FactureMarginTableProps) => {
  const getMarginBadgeColor = (taux: number) => {
    if (taux >= 30) return 'bg-green-100 text-green-800';
    if (taux >= 20) return 'bg-blue-100 text-blue-800';
    if (taux >= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Chargement des factures avec marges...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>N° Facture</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">CA (TTC)</TableHead>
            <TableHead className="text-right">Coût Total</TableHead>
            <TableHead className="text-right">Bénéfice</TableHead>
            <TableHead className="text-center">Taux Marge</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {factures?.length > 0 ? (
            factures.map((facture) => (
              <TableRow key={facture.facture_id}>
                <TableCell className="font-medium">{facture.numero_facture}</TableCell>
                <TableCell>
                  {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell>{facture.client_nom}</TableCell>
                <TableCell className="text-right">{formatCurrency(facture.montant_ttc)}</TableCell>
                <TableCell className="text-right">{formatCurrency(facture.cout_total)}</TableCell>
                <TableCell className="text-right">
                  <span className={facture.benefice_total >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(facture.benefice_total)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getMarginBadgeColor(facture.taux_marge_global)}>
                    {facture.taux_marge_global.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="text-muted-foreground">
                  Aucune facture avec marge trouvée
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FactureMarginTable;
