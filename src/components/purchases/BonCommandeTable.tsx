
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BonCommandeTableRow from './BonCommandeTableRow';

interface BonCommandeTableProps {
  bons: any[];
  articlesCounts: Record<string, number>;
  onApprove: (id: string, bon: any) => void;
  onDelete: (id: string) => void;
}

export const BonCommandeTable = ({ bons, articlesCounts, onApprove, onDelete }: BonCommandeTableProps) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-white border-b border-gray-200 divide-x divide-gray-200">
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3">N° Commande</TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3">Date</TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3">Fournisseur</TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 text-center">Articles</TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 text-center">Statut</TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 text-right">Total</TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {bons.map((bon) => {
                const articlesCount = articlesCounts[bon.id] || 0;
                return (
                  <BonCommandeTableRow
                    key={bon.id}
                    bonCommande={bon}
                    onView={() => {}}
                    onDelete={() => onDelete(bon.id)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
