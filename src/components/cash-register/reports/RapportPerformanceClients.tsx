
import React, { useMemo, useState } from "react";
import { useClientsQuery, useFacturesVenteQuery } from '@/hooks/useSalesQueries';
import ClientReportFilter from './ClientReportFilter';
import ClientReportActions from './ClientReportActions';
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';

const RapportPerformanceClients = () => {
  const { data: clients = [] } = useClientsQuery();
  const { data: factures = [] } = useFacturesVenteQuery();

  // Filtrer par client, "all" par défaut
  const [selectedClientId, setSelectedClientId] = useState<string>("all");

  // Jointure et agrégation par client unique
  const clientStats = useMemo(() => {
    // Le mapping par id
    const stats: { [clientId: string]: any } = {};
    for (const client of clients) {
      stats[client.id] = {
        client,
        totalFactures: 0,
        caTotal: 0,
        paye: 0,
        enRetard: 0,
      }
    }
    factures.forEach(facture => {
      if (selectedClientId !== "all" && facture.client_id !== selectedClientId) return;
      const clid = facture.client_id;
      if (!stats[clid]) return;
      stats[clid].totalFactures += 1;
      stats[clid].caTotal += facture.montant_ttc;
      const totalVerse = (facture.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
      stats[clid].paye += totalVerse;
      if (
        facture.date_echeance &&
        new Date(facture.date_echeance) < new Date() &&
        totalVerse < facture.montant_ttc
      ) {
        stats[clid].enRetard += 1;
      }
    });
    // enlever client sans facture
    return Object.values(stats).filter(stat => stat.totalFactures > 0);
  }, [clients, factures, selectedClientId]);

  function handleGenerate() {}
  function handleExportPDF() {}
  function handleExportExcel() {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <ClientReportFilter
            selectedClient={selectedClientId}
            onSelectedClientChange={setSelectedClientId}
            clients={clients}
          />
        </div>
        <ClientReportActions
          showResults={true}
          onGenerateReport={handleGenerate}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />
      </div>
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
                <TableHead>Payé</TableHead>
                <TableHead>En retard</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-400">
                    Aucun résultat pour la sélection.
                  </TableCell>
                </TableRow>
              ) : clientStats.map(stat => (
                <TableRow key={stat.client.id}>
                  <TableCell>{stat.client.nom}</TableCell>
                  <TableCell>{stat.client.email || stat.client.telephone || "-"}</TableCell>
                  <TableCell>{stat.totalFactures}</TableCell>
                  <TableCell>{formatCurrency(stat.caTotal)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatCurrency(stat.paye)}</Badge>
                  </TableCell>
                  <TableCell>
                    {stat.enRetard > 0 && (
                      <Badge variant="destructive">{stat.enRetard}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
export default RapportPerformanceClients;
