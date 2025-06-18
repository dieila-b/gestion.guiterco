
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Crown } from 'lucide-react';
import { useClientStatistics } from '@/hooks/useClientStats';
import { formatCurrency } from '@/lib/currency';

const MeilleursClients = () => {
  const { data: clientStats = [], isLoading, error } = useClientStatistics();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chargement des statistiques clients...</p>
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

  const topClients = clientStats.filter(client => client.total_facture > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <div>
            <CardTitle>Meilleurs Clients</CardTitle>
            <CardDescription>
              Classement des clients selon leur chiffre d'affaires total
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {topClients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune donnée de vente disponible
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{topClients.length}</p>
                <p className="text-sm text-gray-600">Clients actifs</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(topClients.reduce((sum, client) => sum + client.total_facture, 0))}
                </p>
                <p className="text-sm text-gray-600">CA total</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(topClients.reduce((sum, client) => sum + client.total_paye, 0))}
                </p>
                <p className="text-sm text-gray-600">Total encaissé</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(topClients.reduce((sum, client) => sum + client.nombre_ventes, 0) / topClients.length)}
                </p>
                <p className="text-sm text-gray-600">Ventes/client (moy)</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rang</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Nb Ventes</TableHead>
                  <TableHead>Total Facturé</TableHead>
                  <TableHead>Total Payé</TableHead>
                  <TableHead>Reste à payer</TableHead>
                  <TableHead>Taux paiement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((client, index) => {
                  const tauxPaiement = client.total_facture > 0 
                    ? (client.total_paye / client.total_facture) * 100 
                    : 0;
                  
                  return (
                    <TableRow key={client.client_id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {index < 3 && (
                            <Crown className={`h-4 w-4 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 'text-amber-600'
                            }`} />
                          )}
                          <span className="font-medium">#{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{client.client_nom}</TableCell>
                      <TableCell>{client.client_email || client.client_telephone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{client.nombre_ventes}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(client.total_facture)}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(client.total_paye)}
                      </TableCell>
                      <TableCell className="text-orange-600 font-medium">
                        {formatCurrency(client.reste_a_payer)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={tauxPaiement >= 90 ? "default" : tauxPaiement >= 50 ? "secondary" : "destructive"}
                        >
                          {tauxPaiement.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MeilleursClients;
