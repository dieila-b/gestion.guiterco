
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

export const BonCommandeTable = ({ 
  bons, 
  articlesCounts, 
  onApprove, 
  onDelete 
}: BonCommandeTableProps) => {
  const handleView = (bon: any) => {
    console.log('Viewing bon:', bon);
    // Ici on pourrait ouvrir un modal de détails
  };

  const handleDelete = (bon: any) => {
    onDelete(bon.id);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 min-w-[120px]">
                  N° Commande
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 min-w-[100px]">
                  Date
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 min-w-[150px]">
                  Fournisseur
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 text-center min-w-[80px]">
                  Articles
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 text-center min-w-[100px]">
                  Statut
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 text-right min-w-[120px]">
                  Montant Total
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-sm px-4 py-3 text-center min-w-[120px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {bons && bons.length > 0 ? (
                bons.map((bon) => {
                  const articlesCount = articlesCounts[bon.id] || 0;
                  return (
                    <BonCommandeTableRow
                      key={bon.id}
                      bonCommande={bon}
                      onView={handleView}
                      onDelete={handleDelete}
                      articlesCount={articlesCount}
                    />
                  );
                })
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={7} 
                    className="text-center py-8 text-gray-500"
                  >
                    Aucun bon de commande trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
