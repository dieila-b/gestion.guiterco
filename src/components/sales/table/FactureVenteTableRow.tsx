
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import FacturesVenteActions from '../FacturesVenteActions';
import PaymentStatusBadge from './PaymentStatusBadge';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import {
  getArticleCount,
  getActualPaymentStatus,
  calculatePaidAmount,
  calculateRemainingAmount
} from './StatusUtils';
import type { FactureVente } from '@/types/sales';

interface FactureVenteTableRowProps {
  facture: FactureVente;
}

const FactureVenteTableRow = ({ facture }: FactureVenteTableRowProps) => {
  const articleCount = getArticleCount(facture);
  const actualPaymentStatus = getActualPaymentStatus(facture);
  const paidAmount = calculatePaidAmount(facture);
  const remainingAmount = calculateRemainingAmount(facture);

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-medium text-blue-600">
        {facture.numero_facture}
      </TableCell>
      <TableCell>
        {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
      </TableCell>
      <TableCell className="font-medium">
        {facture.client ? facture.client.nom : 'Client non spécifié'}
      </TableCell>
      <TableCell className="text-center">
        <span className="font-medium text-lg text-blue-600">{articleCount}</span>
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
