
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BonCommandeTableRow } from './BonCommandeTableRow';

interface BonCommandeTableProps {
  bons: any[];
  articlesCounts: Record<string, number>;
  onApprove: (id: string, bon: any) => void;
  onDelete: (id: string) => void;
}

export const BonCommandeTable = ({ bons, articlesCounts, onApprove, onDelete }: BonCommandeTableProps) => {
  return (
    <Table className="border-collapse">
      <TableHeader>
        <TableRow className="border-gray-700">
          <TableHead className="text-gray-300 text-xs px-2 py-1">N° Commande</TableHead>
          <TableHead className="text-gray-300 text-xs px-2 py-1">Date</TableHead>
          <TableHead className="text-gray-300 text-xs px-2 py-1">Fournisseur</TableHead>
          <TableHead className="text-gray-300 text-xs px-2 py-1 text-center">Articles</TableHead>
          <TableHead className="text-gray-300 text-xs px-2 py-1 text-center">Statut</TableHead>
          <TableHead className="text-gray-300 text-xs px-2 py-1 text-center">Total</TableHead>
          <TableHead className="text-gray-300 text-xs px-2 py-1 text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="space-y-0">
        {bons.map((bon) => {
          const articlesCount = articlesCounts[bon.id] || 0;
          return (
            <BonCommandeTableRow
              key={bon.id}
              bon={bon}
              articlesCount={articlesCount}
              onApprove={onApprove}
              onDelete={onDelete}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};
