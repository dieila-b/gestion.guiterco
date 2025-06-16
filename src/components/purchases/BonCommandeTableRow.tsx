
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { BonCommandeActionButtons } from './BonCommandeActionButtons';

interface BonCommandeTableRowProps {
  bon: any;
  articlesCount: number;
  onApprove: (id: string, bon: any) => void;
  onDelete: (id: string) => void;
}

export const BonCommandeTableRow = ({ bon, articlesCount, onApprove, onDelete }: BonCommandeTableRowProps) => {
  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'valide': return 'bg-green-100 text-green-800 border-green-300';
      case 'livre': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'annule': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'En attente';
      case 'valide': return 'Approuvé';
      case 'livre': return 'Livré';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  return (
    <TableRow className="hover:bg-gray-50 transition-colors divide-x divide-gray-200">
      <TableCell className="text-gray-800 font-medium text-sm px-4 py-3">
        {bon.numero_bon}
      </TableCell>
      <TableCell className="text-gray-500 text-sm px-4 py-3">
        {format(new Date(bon.date_commande), 'dd/MM/yyyy', { locale: fr })}
      </TableCell>
      <TableCell className="text-gray-800 text-sm px-4 py-3">
        {bon.fournisseur}
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {articlesCount}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <Badge 
          variant="outline" 
          className={`${getStatusBadgeColor(bon.statut)} font-medium text-xs px-2.5 py-0.5`}
        >
          {getStatusLabel(bon.statut)}
        </Badge>
      </TableCell>
      <TableCell className="text-gray-800 font-semibold text-sm px-4 py-3 text-right">
        {formatCurrency(bon.montant_total)}
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <BonCommandeActionButtons
          bon={bon}
          onApprove={onApprove}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};
