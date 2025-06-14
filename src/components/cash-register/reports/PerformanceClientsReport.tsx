import React, { useState, useMemo } from "react";
import { Button } from '@/components/ui/button';
import { Printer, File, FileSpreadsheet } from "lucide-react";
import { useClientsQuery, useFacturesVenteQuery } from '@/hooks/useSalesQueries';
import { formatCurrency } from "@/lib/currency";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";

const PerformanceClientsReport: React.FC = () => {
  const { data: clients = [] } = useClientsQuery();
  const { data: factures = [] } = useFacturesVenteQuery();
  const [selectedClientId, setSelectedClientId] = useState<string>("all");

  // Aggregated client stats
  const stats = useMemo(() => {
    let clientMap: Record<string, {
      clientNom: string,
      contact: string,
      nbFactures: number,
      caTotal: number,
      montantPaye: number,
      montantEnRetard: number
    }> = {};
    clients.forEach(client => {
      clientMap[client.id] = {
        clientNom: client.nom,
        contact: client.email || client.telephone || "-",
        nbFactures: 0,
        caTotal: 0,
        montantPaye: 0,
        montantEnRetard: 0
      }
    });
    factures.forEach(f => {
      if (!clientMap[f.client_id]) return;
      if (selectedClientId !== "all" && f.client_id !== selectedClientId) return;
      clientMap[f.client_id].nbFactures += 1;
      clientMap[f.client_id].caTotal += (f.montant_ttc || 0);
      const versement = (f.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
      clientMap[f.client_id].montantPaye += versement;
      if (versement < (f.montant_ttc || 0)) {
        clientMap[f.client_id].montantEnRetard += (f.montant_ttc || 0) - versement;
      }
    });
    // Remove clients that have no facture at all
    return Object.values(clientMap).filter(cl => cl.nbFactures > 0);
  }, [clients, factures, selectedClientId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="font-medium mb-1 block">Client</label>
          <select
            className="w-full px-2 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring dark:bg-zinc-900"
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}>
            <option value="all">Tous les clients</option>
            {clients.map(cl => (
              <option key={cl.id} value={cl.id}>{cl.nom}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2"/>Imprimer</Button>
          <Button variant="outline"><File className="mr-2"/>Exporter PDF</Button>
          <Button variant="outline"><FileSpreadsheet className="mr-2"/>Exporter Excel</Button>
        </div>
      </div>
      <div className="overflow-x-auto border border-zinc-100 rounded-lg bg-white shadow dark:bg-zinc-900 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Nb Factures</TableHead>
              <TableHead>CA total</TableHead>
              <TableHead>Payé</TableHead>
              <TableHead>En retard</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.length > 0 ? (
              stats.map((stat, idx) => (
                <TableRow key={idx}>
                  <TableCell>{stat.clientNom}</TableCell>
                  <TableCell>{stat.contact}</TableCell>
                  <TableCell>{stat.nbFactures}</TableCell>
                  <TableCell>{formatCurrency(stat.caTotal)}</TableCell>
                  <TableCell className="text-green-600">{formatCurrency(stat.montantPaye)}</TableCell>
                  <TableCell className="text-orange-500">{formatCurrency(stat.montantEnRetard)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-400">
                  Aucun résultat trouvé pour ce client.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PerformanceClientsReport;
