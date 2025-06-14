
import React, { useState, useMemo } from "react";
import { useClientsQuery, useFacturesVenteQuery } from '@/hooks/useSalesQueries';
import ClientPeriodFilter from "./ClientPeriodFilter";
import StatsCards from "./StatsCards";
import FacturesClientTable from "./FacturesClientTable";
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

  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Filtrer les factures selon le client sélectionné et la période
  const filteredFactures = useMemo(() => {
    let res = factures;
    if (selectedClientId) {
      res = res.filter(f => f.client_id === selectedClientId);
    }
    if (startDate) {
      const startDay = new Date(startDate); startDay.setHours(0,0,0,0);
      res = res.filter(f => new Date(f.date_facture) >= startDay);
    }
    if (endDate) {
      const endDay = new Date(endDate); endDay.setHours(23,59,59,999);
      res = res.filter(f => new Date(f.date_facture) <= endDay);
    }
    return res;
  }, [factures, selectedClientId, startDate, endDate]);

  const { totalVentes, montantEncaisse, resteAPayer } = useMemo(
    () => computeStats(filteredFactures),
    [filteredFactures]
  );

  return (
    <div className="space-y-6">
      {/* Filtres client & période */}
      <ClientPeriodFilter
        clients={clients}
        selectedClientId={selectedClientId}
        onClientChange={val => setSelectedClientId(val)}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={date => setStartDate(date)}
        onEndDateChange={date => setEndDate(date)}
      />

      {/* Cartes de synthèse */}
      <StatsCards
        totalVentes={totalVentes}
        montantEncaisse={montantEncaisse}
        resteAPayer={resteAPayer}
        formatCurrency={formatCurrency}
      />

      {/* Tableau factures */}
      <FacturesClientTable factures={filteredFactures} />
    </div>
  );
};

export default ClientsReports;
