
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
    <div className="border border-gray-300 rounded overflow-hidden">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="border-gray-300 bg-gray-50">
            <TableHead className="text-gray-800 text-xs font-bold px-3 py-2 border-r border-gray-300">N° Commande</TableHead>
            <TableHead className="text-gray-800 text-xs font-bold px-3 py-2 border-r border-gray-300">Date</TableHead>
            <TableHead className="text-gray-800 text-xs font-bold px-3 py-2 border-r border-gray-300">Fournisseur</TableHead>
            <TableHead className="text-gray-800 text-xs font-bold px-3 py-2 text-center border-r border-gray-300">Articles</TableHead>
            <TableHead className="text-gray-800 text-xs font-bold px-3 py-2 text-center border-r border-gray-300">Statut</TableHead>
            <TableHead className="text-gray-800 text-xs font-bold px-3 py-2 text-right border-r border-gray-300">Total</TableHead>
            <TableHead className="text-gray-800 text-xs font-bold px-3 py-2 text-center">Actions</TableHead>
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
    </div>
  );
};
