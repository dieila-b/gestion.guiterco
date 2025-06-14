
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
      case 'en_cours': return 'default';
      case 'valide': return 'secondary';
      case 'livre': return 'outline';
      case 'annule': return 'destructive';
      default: return 'default';
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
    <TableRow className="border-gray-700 hover:bg-gray-700/50">
      <TableCell className="text-white font-medium text-xs px-2 py-1">
        {bon.numero_bon}
      </TableCell>
      <TableCell className="text-gray-300 text-xs px-2 py-1">
        {format(new Date(bon.date_commande), 'dd/MM/yyyy', { locale: fr })}
      </TableCell>
      <TableCell className="text-gray-300 text-xs px-2 py-1">
        {bon.fournisseur}
      </TableCell>
      <TableCell className="text-gray-300 text-xs px-2 py-1 text-center">
        <span className="bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded text-xs">
          {articlesCount} article{articlesCount > 1 ? 's' : ''}
        </span>
      </TableCell>
      <TableCell className="px-2 py-1 text-center">
        <Badge variant={getStatusBadgeColor(bon.statut)} className="text-xs px-1 py-0.5">
          {getStatusLabel(bon.statut)}
        </Badge>
      </TableCell>
      <TableCell className="text-white font-bold text-sm px-2 py-1 text-center">
        {formatCurrency(bon.montant_total)}
      </TableCell>
      <TableCell className="px-2 py-1 text-center">
        <BonCommandeActionButtons
          bon={bon}
          onApprove={onApprove}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};
