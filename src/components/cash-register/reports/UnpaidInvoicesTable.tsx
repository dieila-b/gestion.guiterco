
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import type { FactureVente } from '@/types/sales'; // Assuming FactureVente is in types/sales

interface UnpaidInvoicesTableProps {
  factures: FactureVente[];
}

const UnpaidInvoicesTable: React.FC<UnpaidInvoicesTableProps> = ({ factures }) => {
  const getRetardDays = (dateEcheance: string | null | undefined) => {
    if (!dateEcheance) return 0;
    const today = new Date();
    const echeance = new Date(dateEcheance);
    return Math.max(0, differenceInDays(today, echeance));
  };

  const getRetardBadge = (retardDays: number) => {
    if (retardDays === 0) return null;
    if (retardDays <= 7) return <Badge variant="secondary">Retard {retardDays}j</Badge>;
    if (retardDays <= 30) return <Badge variant="destructive">Retard {retardDays}j</Badge>;
    return <Badge variant="destructive">Retard {retardDays}j ⚠️</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détail des factures impayées ({factures.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date facture</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Montant TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Retard</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factures.map((facture) => {
              const retardDays = getRetardDays(facture.date_echeance);
              return (
                <TableRow key={facture.id}>
                  <TableCell className="font-medium">{facture.numero_facture}</TableCell>
                  <TableCell>
                    {facture.client ? facture.client.nom : 'Client non spécifié'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {facture.date_echeance 
                      ? format(new Date(facture.date_echeance), 'dd/MM/yyyy', { locale: fr })
                      : 'Non définie'
                    }
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(facture.montant_ttc)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      facture.statut_paiement === 'en_retard' ? 'destructive' :
                      facture.statut_paiement === 'partiellement_payee' ? 'secondary' : 'default'
                    }>
                      {facture.statut_paiement}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getRetardBadge(retardDays)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UnpaidInvoicesTable;
