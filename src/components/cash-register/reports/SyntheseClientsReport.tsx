
import React, { useMemo, useState } from "react";
import { useClientsQuery, useFacturesVenteQuery } from '@/hooks/useSalesQueries';
import ClientPeriodFilter from './ClientPeriodFilter';
import StatsCards from './StatsCards';
import FacturesClientTable from './FacturesClientTable';
import { Button } from '@/components/ui/button';
import { Printer, FilePdf } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const SyntheseClientsReport: React.FC = () => {
  const { data: clients = [] } = useClientsQuery();
  const { data: factures = [] } = useFacturesVenteQuery();

  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{start?: Date, end?: Date}>({});

  // Filtered factures by client and period
  const filteredFactures = useMemo(() => {
    let res = factures;
    if (selectedClientId) {
      res = res.filter(f => f.client_id === selectedClientId);
    }
    if (dateRange.start) {
      res = res.filter(f => new Date(f.date_facture) >= dateRange.start!);
    }
    if (dateRange.end) {
      res = res.filter(f => new Date(f.date_facture) <= dateRange.end!);
    }
    return res;
  }, [factures, selectedClientId, dateRange]);

  // Compute totals
  const totalVentes = filteredFactures.reduce((sum, f) => sum + (f.montant_ttc || 0), 0);
  const montantEncaisse = filteredFactures.reduce(
    (sum, f) => sum + ((f.versements ?? []).reduce((sv, v) => sv + (v.montant || 0), 0)),
    0
  );
  const resteAPayer = totalVentes - montantEncaisse;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <ClientPeriodFilter
            clients={clients}
            selectedClientId={selectedClientId}
            onClientChange={setSelectedClientId}
            startDate={dateRange.start}
            endDate={dateRange.end}
            onStartDateChange={date => setDateRange(d => ({ ...d, start: date ?? undefined }))}
            onEndDateChange={date => setDateRange(d => ({ ...d, end: date ?? undefined }))}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2"/>Imprimer</Button>
          <Button variant="outline"><FilePdf className="mr-2"/>Exporter PDF</Button>
        </div>
      </div>
      <StatsCards 
        totalVentes={totalVentes}
        montantEncaisse={montantEncaisse}
        resteAPayer={resteAPayer}
        formatCurrency={formatCurrency}
      />
      <div>
        <h2 className="font-semibold text-lg mb-2">Détail des factures</h2>
        <FacturesClientTable factures={filteredFactures} clientSelected={!!selectedClientId} />
      </div>
    </div>
  );
};

export default SyntheseClientsReport;
