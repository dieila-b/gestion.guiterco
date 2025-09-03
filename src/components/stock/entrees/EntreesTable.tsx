
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/currency';
import { EntreeStock } from '@/components/stock/types';
import { Badge } from '@/components/ui/badge';
import { useViewPermissions } from '@/hooks/useViewPermissions';

interface EntreesTableProps {
  entrees: EntreeStock[] | undefined;
  isLoading: boolean;
}

export const EntreesTable = ({ entrees, isLoading }: EntreesTableProps) => {
  const { shouldBlurFinancialData } = useViewPermissions();
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
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Article</TableHead>
            <TableHead className="font-semibold">Emplacement</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold text-right">Quantité</TableHead>
            <TableHead className="font-semibold">Fournisseur</TableHead>
            <TableHead className="font-semibold text-right">
              {shouldBlurFinancialData() ? "• • • • •" : "Prix unitaire"}
            </TableHead>
            <TableHead className="font-semibold">Bon</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entrees && entrees.length > 0 ? (
            entrees.map((entree) => (
              <TableRow key={entree.id}>
                <TableCell className="font-medium">
                  {formatDate(entree.created_at)}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{entree.article?.nom || `Article ID: ${entree.article_id}`}</div>
                    {entree.article?.reference && (
                      <div className="text-sm text-muted-foreground">
                        {entree.article.reference}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {entree.entrepot?.nom || entree.point_vente?.nom || 
                   (entree.entrepot_id ? `Entrepôt ID: ${entree.entrepot_id}` : 
                    entree.point_vente_id ? `PDV ID: ${entree.point_vente_id}` : 'Dépôt A')}
                </TableCell>
                <TableCell>
                  {getTypeEntreeBadge(entree.type_entree)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {entree.quantite.toLocaleString()}
                  {entree.article?.unite_mesure && (
                    <span className="text-muted-foreground ml-1">
                      {entree.article.unite_mesure}
                    </span>
                  )}
                </TableCell>
                <TableCell>{entree.fournisseur || 'N/A'}</TableCell>
                <TableCell className={`text-right font-medium ${shouldBlurFinancialData() ? 'blur-sm select-none pointer-events-none' : ''}`}>
                  {shouldBlurFinancialData() ? "• • • • •" : (entree.prix_unitaire ? formatCurrency(entree.prix_unitaire) : 'N/A')}
                </TableCell>
                <TableCell className="font-medium">
                  {entree.numero_bon || 'N/A'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="space-y-2">
                  <div className="text-muted-foreground">
                    Aucune entrée trouvée
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Les données de la table entrees_stock sont maintenant synchronisées
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
