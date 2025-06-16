
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PaymentStatusBadge from './PaymentStatusBadge';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import ArticleCountCell from './ArticleCountCell';
import ActionButtons from '../actions/ActionButtons';
import { calculatePaidAmount, calculateRemainingAmount } from './StatusUtils';
import type { FactureVente } from '@/types/sales';

interface FactureVenteTableRowProps {
  facture: FactureVente;
}

const FactureVenteTableRow = ({ facture }: FactureVenteTableRowProps) => {
  const paidAmount = calculatePaidAmount(facture);
  const remainingAmount = calculateRemainingAmount(facture);
  
  console.log('🔍 Rendu ligne facture:', {
    numero: facture.numero_facture,
    montant_ttc: facture.montant_ttc,
    paye: paidAmount,
    restant: remainingAmount,
    versements: facture.versements
  });

  return (
    <TableRow className="hover:bg-gray-50/50">
      <TableCell className="font-medium text-gray-900">
        {facture.numero_facture}
      </TableCell>
      
      <TableCell className="text-gray-600">
        {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
      </TableCell>
      
      <TableCell className="text-gray-800">
        {facture.client?.nom || 'Client non défini'}
        {facture.client?.nom_entreprise && ` (${facture.client.nom_entreprise})`}
      </TableCell>
      
      <ArticleCountCell facture={facture} />
      
      <TableCell className="text-right font-medium text-gray-900">
        {formatCurrency(facture.montant_ttc)}
      </TableCell>
      
      <TableCell className="text-right text-green-600 font-medium">
        {formatCurrency(paidAmount)}
      </TableCell>
      
      <TableCell className="text-right text-orange-600 font-medium">
        {formatCurrency(remainingAmount)}
      </TableCell>
      
      <TableCell className="text-center">
        <PaymentStatusBadge facture={facture} />
      </TableCell>
      
      <TableCell className="text-center">
        <DeliveryStatusBadge facture={facture} />
      </TableCell>
      
      <TableCell className="text-center">
        <ActionButtons facture={facture} />
      </TableCell>
    </TableRow>
  );
};

export default FactureVenteTableRow;
