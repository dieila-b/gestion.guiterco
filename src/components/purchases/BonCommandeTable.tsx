
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
    <Table>
      <TableHeader>
        <TableRow className="border-gray-700">
          <TableHead className="text-gray-300">N° Commande</TableHead>
          <TableHead className="text-gray-300">Date</TableHead>
          <TableHead className="text-gray-300">Fournisseur</TableHead>
          <TableHead className="text-gray-300">Articles</TableHead>
          <TableHead className="text-gray-300">Statut</TableHead>
          <TableHead className="text-gray-300">Total</TableHead>
          <TableHead className="text-gray-300 text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
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
