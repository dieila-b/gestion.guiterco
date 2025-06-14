
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import type { Client, FactureVente } from '@/types/sales';

interface ClientStat {
  client: Client;
  totalFactures: number;
  totalCA: number;
  facturesPayees: number;
  facturesEnRetard: number;
  facturesRecentes: FactureVente[]; // Kept for consistency with SelectedClientReport's type, though not directly used in this table
}

interface AllClientsReportTableProps {
  clientStats: ClientStat[];
}

const AllClientsReportTable: React.FC<AllClientsReportTableProps> = ({ clientStats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rapport performance clients</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Nb Factures</TableHead>
              <TableHead>CA Total</TableHead>
              <TableHead>Payées</TableHead>
              <TableHead>En retard</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientStats.map((stat) => (
              <TableRow key={stat.client.id}>
                <TableCell className="font-medium">
                  {stat.client.nom}
                </TableCell>
                <TableCell>{stat.client.email || stat.client.telephone || '-'}</TableCell>
                <TableCell>{stat.totalFactures}</TableCell>
                <TableCell>{formatCurrency(stat.totalCA)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{stat.facturesPayees}</Badge>
                </TableCell>
                <TableCell>
                  {stat.facturesEnRetard > 0 && (
                    <Badge variant="destructive">{stat.facturesEnRetard}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AllClientsReportTable;
