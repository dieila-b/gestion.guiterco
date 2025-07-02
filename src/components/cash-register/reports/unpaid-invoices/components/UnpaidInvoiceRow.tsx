
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Printer, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import ArticleCountCell from '@/components/sales/table/ArticleCountCell';
import EditFactureDialog from '@/components/sales/actions/EditFactureDialog';
import { printFactureVente, printTicket } from '@/components/sales/actions/print';
import StatusBadges from './StatusBadges';
import type { FactureVente } from '@/types/sales';

interface UnpaidInvoiceRowProps {
  facture: FactureVente;
}

const UnpaidInvoiceRow: React.FC<UnpaidInvoiceRowProps> = ({ facture }) => {
  const montantPaye = (facture.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
  const montantRestant = (facture.montant_ttc || 0) - montantPaye;

  const handlePrintFacture = () => {
    printFactureVente(facture);
  };

  const handlePrintTicket = () => {
    printTicket(facture);
  };

  return (
    <TableRow className="hover:bg-muted/25">
      <TableCell className="font-medium">
        {facture.numero_facture || 'N/A'}
      </TableCell>
      <TableCell>
        {format(new Date(facture.date_facture), "dd/MM/yyyy", { locale: fr })}
      </TableCell>
      <TableCell>
        {facture.client?.nom || 'Client non spécifié'}
      </TableCell>
      <TableCell>
        <ArticleCountCell facture={facture} />
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(facture.montant_ttc || 0)}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(montantPaye)}
      </TableCell>
      <TableCell className="text-right font-bold text-red-600">
        {formatCurrency(montantRestant)}
      </TableCell>
      <TableCell>
        <StatusBadges statut={facture.statut_paiement} type="payment" />
      </TableCell>
      <TableCell>
        <StatusBadges statut={facture.statut_livraison} type="delivery" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <EditFactureDialog facture={facture} />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrintFacture}
            className="text-green-600 hover:text-green-800"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrintTicket}
            className="text-purple-600 hover:text-purple-800"
          >
            <Receipt className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UnpaidInvoiceRow;
