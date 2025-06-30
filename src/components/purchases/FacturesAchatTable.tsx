
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { EditFactureAchatDialog } from './EditFactureAchatDialog';
import { DeleteFactureAchatDialog } from './DeleteFactureAchatDialog';
import { PrintFactureAchatDialog } from './PrintFactureAchatDialog';

interface FacturesAchatTableProps {
  filteredFactures: any[];
  getArticleCount: (facture: any) => number;
  getPaidAmount: (facture: any) => number;
  getRemainingAmount: (facture: any) => number;
  getStatusBadgeColor: (statut: string) => string;
  getStatusLabel: (statut: string) => string;
}

const FacturesAchatTable = ({ 
  filteredFactures, 
  getArticleCount, 
  getPaidAmount, 
  getRemainingAmount,
  getStatusBadgeColor,
  getStatusLabel 
}: FacturesAchatTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">N° Facture</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Fournisseur</TableHead>
            <TableHead className="font-semibold text-center">Articles</TableHead>
            <TableHead className="font-semibold text-right">Payé</TableHead>
            <TableHead className="font-semibold text-right">Reste</TableHead>
            <TableHead className="font-semibold text-right">Montant</TableHead>
            <TableHead className="font-semibold text-center">Statut</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFactures && filteredFactures.length > 0 ? (
            filteredFactures.map((facture) => {
              const articleCount = getArticleCount(facture);
              const paidAmount = getPaidAmount(facture);
              const remainingAmount = getRemainingAmount(facture);
              
              return (
                <TableRow key={facture.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-blue-600">
                    {facture.numero_facture}
                  </TableCell>
                  <TableCell>
                    {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {facture.fournisseur}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium text-lg ${articleCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {articleCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    {formatCurrency(paidAmount)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-orange-600">
                    {formatCurrency(remainingAmount)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(facture.montant_ttc)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusBadgeColor(facture.statut_paiement)} font-medium`}
                    >
                      {getStatusLabel(facture.statut_paiement)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-1">
                      <EditFactureAchatDialog facture={facture} />
                      <DeleteFactureAchatDialog 
                        factureId={facture.id} 
                        numeroFacture={facture.numero_facture} 
                      />
                      <PrintFactureAchatDialog facture={facture} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="text-muted-foreground">
                  Aucune facture d'achat trouvée
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacturesAchatTable;
