
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

  const formatNumeroCommande = (numero: string, date: string) => {
    if (numero.match(/^BC-\d{4}-\d{2}-\d{2}-\d{3}$/)) {
      return numero;
    }
    
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const timeComponent = Date.now().toString().slice(-3);
    
    return `BC-${year}-${month}-${day}-${timeComponent}`;
  };

  return (
    <TableRow className="border-gray-700 hover:bg-gray-700/50">
      <TableCell className="text-white font-medium">
        {formatNumeroCommande(bon.numero_bon, bon.date_commande)}
      </TableCell>
      <TableCell className="text-gray-300">
        {format(new Date(bon.date_commande), 'dd/MM/yyyy', { locale: fr })}
      </TableCell>
      <TableCell className="text-gray-300">
        {bon.fournisseur}
      </TableCell>
      <TableCell className="text-gray-300">
        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
          {articlesCount} article{articlesCount > 1 ? 's' : ''}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeColor(bon.statut)} className="text-xs">
          {getStatusLabel(bon.statut)}
        </Badge>
      </TableCell>
      <TableCell className="text-white font-semibold">
        {formatCurrency(bon.montant_total)}
      </TableCell>
      <TableCell>
        <BonCommandeActionButtons
          bon={bon}
          onApprove={onApprove}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};
