
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { formatCurrency } from '@/lib/currency';
import { EntreeStock } from '@/components/stock/types';
import { Badge } from '@/components/ui/badge';

interface EntreesTableProps {
  entrees: EntreeStock[] | undefined;
  isLoading: boolean;
}

export const EntreesTable = ({ entrees, isLoading }: EntreesTableProps) => {
  console.log('EntreesTable - entrees:', entrees);
  console.log('EntreesTable - isLoading:', isLoading);

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

  const getTypeEntreeBadge = (typeEntree: string) => {
    const variants = {
      'achat': 'default',
      'retour': 'secondary', 
      'transfert': 'outline',
      'correction': 'destructive'
    } as const;

    const labels = {
      'achat': 'Achat',
      'retour': 'Retour', 
      'transfert': 'Transfert',
      'correction': 'Correction'
    };

    return (
      <Badge variant={variants[typeEntree as keyof typeof variants] || 'default'}>
        {labels[typeEntree as keyof typeof labels] || typeEntree}
      </Badge>
    );
  };

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
            <TableHead>Observations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entrees && entrees.length > 0 ? (
            entrees.map((entree) => {
              console.log('Rendering entree:', entree);
              
              return (
                <TableRow key={entree.id}>
                  <TableCell>
                    {format(new Date(entree.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <div>{entree.article?.nom || 'Article non trouvé'}</div>
                      {entree.article?.reference && (
                        <div className="text-sm text-muted-foreground">
                          Réf: {entree.article.reference}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {entree.entrepot?.nom || entree.point_vente?.nom || 'Emplacement non défini'}
                  </TableCell>
                  <TableCell>
                    {getTypeEntreeBadge(entree.type_entree)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {entree.quantite}
                    {entree.article?.unite_mesure && (
                      <span className="text-muted-foreground ml-1">
                        {entree.article.unite_mesure}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{entree.fournisseur || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {entree.prix_unitaire ? formatCurrency(entree.prix_unitaire) : 'N/A'}
                  </TableCell>
                  <TableCell>{entree.numero_bon || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {entree.observations || 'N/A'}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="space-y-2">
                  <div className="text-muted-foreground">
                    Aucune entrée trouvée
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Les entrées de stock apparaîtront ici une fois créées
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
