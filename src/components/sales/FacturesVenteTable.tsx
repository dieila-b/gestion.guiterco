
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import FactureVenteTableRow from './table/FactureVenteTableRow';
import type { FactureVente } from '@/types/sales';

interface FacturesVenteTableProps {
  factures: FactureVente[];
  isLoading: boolean;
  showOnlyUnpaid?: boolean;
}

const FacturesVenteTable = ({ factures, isLoading, showOnlyUnpaid = false }: FacturesVenteTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Chargement des factures...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-left">N° Facture</TableHead>
            <TableHead className="font-semibold text-left">Date</TableHead>
            <TableHead className="font-semibold text-left">Client</TableHead>
            <TableHead className="font-semibold text-center">Articles</TableHead>
            <TableHead className="font-semibold text-right">Total</TableHead>
            <TableHead className="font-semibold text-right">Payé</TableHead>
            <TableHead className="font-semibold text-right">Restant</TableHead>
            <TableHead className="font-semibold text-center">Paiement</TableHead>
            <TableHead className="font-semibold text-center">Livraison</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {factures && factures.length > 0 ? (
            factures.map((facture) => (
              <FactureVenteTableRow key={facture.id} facture={facture} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                <div className="text-muted-foreground">
                  {showOnlyUnpaid 
                    ? "Aucune facture impayée trouvée"
                    : "Aucune facture de vente trouvée"
                  }
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacturesVenteTable;
