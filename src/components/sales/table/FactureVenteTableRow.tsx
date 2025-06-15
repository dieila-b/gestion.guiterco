
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import FacturesVenteActions from '../FacturesVenteActions';
import PaymentStatusBadge from './PaymentStatusBadge';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import ArticleCountCell from './ArticleCountCell';
import {
  getActualPaymentStatus,
  calculatePaidAmount,
  calculateRemainingAmount
} from './StatusUtils';
import type { FactureVente } from '@/types/sales';

interface FactureVenteTableRowProps {
  facture: FactureVente;
}

const FactureVenteTableRow = ({ facture }: FactureVenteTableRowProps) => {
  const actualPaymentStatus = getActualPaymentStatus(facture);
  const paidAmount = calculatePaidAmount(facture);
  const remainingAmount = calculateRemainingAmount(facture);

  // Formater la date avec l'heure
  const formatDateWithTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    }
  };

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-medium text-blue-600">
        {facture.numero_facture}
      </TableCell>
      <TableCell>
        {formatDateWithTime(facture.date_facture)}
      </TableCell>
      <TableCell className="font-medium">
        {facture.client ? facture.client.nom : 'Client non spécifié'}
      </TableCell>
      <TableCell className="text-center">
        <ArticleCountCell facture={facture} />
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(facture.montant_ttc)}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(paidAmount)}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(remainingAmount)}
      </TableCell>
      <TableCell className="text-center">
        <PaymentStatusBadge status={actualPaymentStatus} />
      </TableCell>
      <TableCell className="text-center">
        <DeliveryStatusBadge facture={facture} />
      </TableCell>
      <TableCell className="text-center">
        <FacturesVenteActions facture={facture} />
      </TableCell>
    </TableRow>
  );
};

export default FactureVenteTableRow;
