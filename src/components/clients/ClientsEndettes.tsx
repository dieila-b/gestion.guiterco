
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, DollarSign, FileText } from 'lucide-react';
import { useClientsEndettes } from '@/hooks/useClientStats';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StatsGlobales {
  totalClients: number;
  totalDette: number;
  totalFactures: number;
  montantTotal: number;
}

const ClientsEndettes = () => {
  const { data: clientsEndettes = [], isLoading, error } = useClientsEndettes();

  const clientsGroupes = useMemo(() => {
    const grouped = clientsEndettes.reduce((acc, item) => {
      if (!acc[item.client_id]) {
        acc[item.client_id] = {
          client: {
            id: item.client_id,
            nom: item.client_nom,
            email: item.client_email,
            telephone: item.client_telephone
          },
          factures: [],
          totalDette: 0,
          totalFacture: 0,
          totalPaye: 0
        };
      }
      
      acc[item.client_id].factures.push({
        id: item.facture_id,
        numero_facture: item.numero_facture,
        date_facture: item.date_facture,
        montant_total: item.montant_total,
        montant_paye: item.montant_paye,
        reste_a_payer: item.reste_a_payer,
        statut_paiement: item.statut_paiement
      });
      
      acc[item.client_id].totalDette += item.reste_a_payer;
      acc[item.client_id].totalFacture += item.montant_total;
      acc[item.client_id].totalPaye += item.montant_paye;
      
      return acc;
    }, {} as any);

    return Object.values(grouped).sort((a: any, b: any) => b.totalDette - a.totalDette);
  }, [clientsEndettes]);

  const statsGlobales = useMemo((): StatsGlobales => {
    return clientsGroupes.reduce((acc: StatsGlobales, client: any) => {
      acc.totalClients = clientsGroupes.length;
      acc.totalDette += client.totalDette;
      acc.totalFactures += client.factures.length;
      acc.montantTotal += client.totalFacture;
      return acc;
    }, { totalClients: 0, totalDette: 0, totalFactures: 0, montantTotal: 0 });
  }, [clientsGroupes]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chargement des clients endettés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erreur lors du chargement des données</p>
      </div>
    );
  }

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
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <div>
            <CardTitle>Clients Endettés</CardTitle>
            <CardDescription>
              Suivi des factures impayées et des créances clients
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {clientsGroupes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium text-green-600">Excellent !</p>
            <p>Aucun client n'a de factures impayées</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{statsGlobales.totalClients}</p>
                <p className="text-sm text-gray-600">Clients endettés</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(statsGlobales.totalDette)}
                </p>
                <p className="text-sm text-gray-600">Total des créances</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{statsGlobales.totalFactures}</p>
                <p className="text-sm text-gray-600">Factures impayées</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(statsGlobales.montantTotal)}
                </p>
                <p className="text-sm text-gray-600">Montant total facturé</p>
              </div>
            </div>

            <div className="space-y-6">
              {clientsGroupes.map((clientGroupe: any) => (
                <Card key={clientGroupe.client.id} className="border-l-4 border-l-orange-500">
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
                        {clientGroupe.factures.map((facture: any) => (
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
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsEndettes;
