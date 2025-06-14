import React, { useState, useMemo } from "react";
import { useClientsQuery, useFacturesVenteQuery } from '@/hooks/useSalesQueries';
import ClientReportFilter from './ClientReportFilter';
import ClientReportActions from './ClientReportActions';
import AllClientsReportTable from './AllClientsReportTable';
import { formatCurrency } from "@/lib/currency";
import type { FactureVente, Client } from "@/types/sales";

// Calcul des totaux pour des factures filtrées
const computeStats = (factures: FactureVente[]) => {
  const totalVentes = factures.reduce((sum, f) => sum + (f.montant_ttc || 0), 0);
  const montantEncaisse = factures.reduce(
    (sum, f) => sum + ((f.versements ?? []).reduce((sv, v) => sv + (v.montant || 0), 0)),
    0
  );
  const resteAPayer = totalVentes - montantEncaisse;
  return { totalVentes, montantEncaisse, resteAPayer };
};

const ClientsReports: React.FC = () => {
  const { data: clients = [] } = useClientsQuery();
  const { data: factures = [] } = useFacturesVenteQuery();

  // Client selection for filter
  const [selectedClientId, setSelectedClientId] = useState<string>("all"); // "all" by default

  // Filtrer les factures selon le client sélectionné
  const filteredFactures = useMemo(() => {
    if (selectedClientId === "all") return factures;
    return factures.filter(f => f.client_id === selectedClientId);
  }, [factures, selectedClientId]);

  // Agréger les ventes/factures par client unique
  const clientStats = useMemo(() => {
    let stats: { [clientId: string]: any } = {};
    for (const client of clients) {
      stats[client.id] = {
        client,
        totalFactures: 0,
        totalCA: 0,
        facturesPayees: 0,
        facturesEnRetard: 0,
        facturesRecentes: [],
      }
    }
    filteredFactures.forEach(facture => {
      const clid = facture.client_id;
      if (!stats[clid]) return;
      stats[clid].totalFactures += 1;
      stats[clid].totalCA += facture.montant_ttc;
      // Paiement: une facture est payée si tous versements >= montant_ttc, en retard si montant payé < montant_ttc et date_echeance < aujourd'hui
      const totalVerse = (facture.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
      if (totalVerse >= facture.montant_ttc) {
        stats[clid].facturesPayees += 1;
      } else if (facture.date_echeance && new Date(facture.date_echeance) < new Date() && totalVerse < facture.montant_ttc) {
        stats[clid].facturesEnRetard += 1;
      }
      // Collecte des factures pour détail éventuel
      stats[clid].facturesRecentes.push(facture);
    });
    // Retirer les clients sans aucune facture
    return Object.values(stats).filter(stat => stat.totalFactures > 0);
  }, [filteredFactures, clients]);

  function handleGenerate() { /* aucun effet requis pour ce bouton ici */ }
  function handleExportPDF() {/* TODO: add export PDF report */}
  function handleExportExcel() { /* TODO: add export XLS report */ }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Synthèse Clients</h2>
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
      <AllClientsReportTable clientStats={clientStats} />
    </div>
  );
};

export default ClientsReports;
