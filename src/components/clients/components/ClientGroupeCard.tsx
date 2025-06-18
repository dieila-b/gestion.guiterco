
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ClientGroupe } from '../types';

interface ClientGroupeCardProps {
  clientGroupe: ClientGroupe;
}

export const ClientGroupeCard: React.FC<ClientGroupeCardProps> = ({ clientGroupe }) => {
  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'non_paye':
        return <Badge variant="destructive">Non payé</Badge>;
      case 'partiel':
        return <Badge variant="secondary">Paiement partiel</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{clientGroupe.client.nom}</CardTitle>
            <CardDescription>
              {clientGroupe.client.email || clientGroupe.client.telephone || 'Pas de contact'}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(clientGroupe.totalDette)}
            </p>
            <p className="text-sm text-gray-500">
              {clientGroupe.factures.length} facture(s) impayée(s)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant Total</TableHead>
              <TableHead>Montant Payé</TableHead>
              <TableHead>Reste à Payer</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientGroupe.factures.map((facture) => (
              <TableRow key={facture.id}>
                <TableCell className="font-medium">
                  {facture.numero_facture}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(facture.montant_total)}
                </TableCell>
                <TableCell className="text-green-600">
                  {formatCurrency(facture.montant_paye)}
                </TableCell>
                <TableCell className="font-bold text-red-600">
                  {formatCurrency(facture.reste_a_payer)}
                </TableCell>
                <TableCell>
                  {getStatutBadge(facture.statut_paiement)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
