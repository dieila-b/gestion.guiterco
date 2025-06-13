
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { formatCurrency } from '@/lib/currency';
import { EntreeStock } from '@/components/stock/types';

interface EntreesTableProps {
  entrees: EntreeStock[] | undefined;
  isLoading: boolean;
}

export const EntreesTable = ({ entrees, isLoading }: EntreesTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Article</TableHead>
            <TableHead>Emplacement</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead className="text-right">Prix unitaire</TableHead>
            <TableHead>Bon</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entrees && entrees.length > 0 ? (
            entrees.map((entree) => (
              <TableRow key={entree.id}>
                <TableCell>
                  {format(new Date(entree.created_at), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell className="font-medium">
                  {entree.article?.nom || 'N/A'}
                </TableCell>
                <TableCell>{entree.entrepot?.nom || 'N/A'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    entree.type_entree === 'achat' 
                      ? 'bg-blue-100 text-blue-800' 
                      : entree.type_entree === 'retour'
                      ? 'bg-green-100 text-green-800'
                      : entree.type_entree === 'transfert'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {entree.type_entree === 'achat' 
                      ? 'Achat' 
                      : entree.type_entree === 'retour'
                      ? 'Retour'
                      : entree.type_entree === 'transfert'
                      ? 'Transfert'
                      : 'Correction'}
                  </span>
                </TableCell>
                <TableCell className="text-right">{entree.quantite}</TableCell>
                <TableCell>{entree.fournisseur || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  {entree.prix_unitaire ? formatCurrency(entree.prix_unitaire) : 'N/A'}
                </TableCell>
                <TableCell>{entree.numero_bon || 'N/A'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Aucune entrée trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
