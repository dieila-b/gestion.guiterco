
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Filter, Users } from 'lucide-react';
import { useClientsQuery, useFacturesVenteQuery } from '@/hooks/useSales';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';

const ClientsReports: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [showResults, setShowResults] = useState(false);

  const { data: clients } = useClientsQuery();
  const { data: factures } = useFacturesVenteQuery();

  const clientStats = clients?.map(client => {
    const clientFactures = factures?.filter(f => f.client_id === client.id) || [];
    const totalCA = clientFactures.reduce((sum, f) => sum + f.montant_ttc, 0);
    const facturesPayees = clientFactures.filter(f => f.statut_paiement === 'payee');
    const facturesEnRetard = clientFactures.filter(f => {
      if (!f.date_echeance) return false;
      return new Date(f.date_echeance) < new Date() && f.statut_paiement !== 'payee';
    });

    return {
      client,
      totalFactures: clientFactures.length,
      totalCA,
      facturesPayees: facturesPayees.length,
      facturesEnRetard: facturesEnRetard.length,
      facturesRecentes: clientFactures.slice(-5) // Ensure facturesRecentes is an array
    };
  }).sort((a, b) => b.totalCA - a.totalCA) || [];

  const selectedClientData = selectedClient !== 'all' ? 
    clientStats.find(stat => stat.client.id === selectedClient) : null;

  const handleGenerateReport = () => {
    setShowResults(true);
  };

  const handleExportPDF = () => {
    console.log('Export PDF rapport clients');
  };

  const handleExportExcel = () => {
    console.log('Export Excel rapport clients');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sélectionner un client (optionnel)</Label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clients</SelectItem>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleGenerateReport}>
          <Filter className="mr-2 h-4 w-4" />
          Générer le rapport
        </Button>
        {showResults && (
          <>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </>
        )}
      </div>

      {showResults && (
        <div className="space-y-4">
          {selectedClientData ? (
            // Rapport pour un client spécifique
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Rapport détaillé - {selectedClientData.client.nom}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedClientData.totalFactures}</p>
                      <p className="text-sm text-muted-foreground">Factures totales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatCurrency(selectedClientData.totalCA)}</p>
                      <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedClientData.facturesPayees}</p>
                      <p className="text-sm text-muted-foreground">Factures payées</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedClientData.facturesEnRetard}</p>
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
                      {selectedClientData.facturesRecentes.map((facture) => (
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
            </div>
          ) : (
            // Rapport pour tous les clients
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
          )}
        </div>
      )}
    </div>
  );
};

export default ClientsReports;

