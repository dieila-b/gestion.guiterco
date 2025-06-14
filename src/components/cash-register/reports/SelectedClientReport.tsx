
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import type { Client, FactureVente } from '@/types/sales';

interface ClientStat {
  client: Client;
  totalFactures: number;
  totalCA: number;
  facturesPayees: number;
  facturesEnRetard: number;
  facturesRecentes: FactureVente[];
}

interface SelectedClientReportProps {
  clientData: ClientStat;
}

const SelectedClientReport: React.FC<SelectedClientReportProps> = ({ clientData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Rapport détaillé - {clientData.client.nom}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{clientData.totalFactures}</p>
            <p className="text-sm text-muted-foreground">Factures totales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{formatCurrency(clientData.totalCA)}</p>
            <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{clientData.facturesPayees}</p>
            <p className="text-sm text-muted-foreground">Factures payées</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{clientData.facturesEnRetard}</p>
            <p className="text-sm text-muted-foreground">Factures en retard</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro facture</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant TTC</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientData.facturesRecentes.map((facture) => (
              <TableRow key={facture.id}>
                <TableCell className="font-medium">{facture.numero_facture}</TableCell>
                <TableCell>{new Date(facture.date_facture).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>{formatCurrency(facture.montant_ttc)}</TableCell>
                <TableCell>
                  <Badge variant={facture.statut_paiement === 'payee' ? 'outline' : 'secondary'}>
                    {facture.statut_paiement}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SelectedClientReport;
