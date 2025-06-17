
import React, { useMemo, useState } from 'react';
import { useFacturesVenteQuery, useClientsQuery } from '@/hooks/useSalesQueries';
import UnpaidInvoicesHeader from './unpaid-invoices/UnpaidInvoicesHeader';
import UnpaidInvoicesFilters from './unpaid-invoices/UnpaidInvoicesFilters';
import UnpaidInvoicesStats from './unpaid-invoices/UnpaidInvoicesStats';
import UnpaidInvoicesTable from './unpaid-invoices/UnpaidInvoicesTable';

const UnpaidInvoicesReports: React.FC = () => {
  const { data: factures = [], isLoading } = useFacturesVenteQuery();
  const { data: clients = [] } = useClientsQuery();

  // State for filters
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{start?: Date, end?: Date}>({});
  const [searchFacture, setSearchFacture] = useState('');

  // Filtered unpaid invoices with remaining amount > 0
  const filteredFactures = useMemo(() => {
    let res = factures.filter(f => {
      // Calculer le montant payé pour chaque facture
      const montantPaye = (f.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
      const montantRestant = (f.montant_ttc || 0) - montantPaye;
      
      // Ne garder que les factures avec un montant restant > 0
      return montantRestant > 0;
    });

    if (selectedClientId) {
      res = res.filter(f => f.client_id === selectedClientId);
    }
    if (dateRange.start) {
      res = res.filter(f => new Date(f.date_facture) >= dateRange.start!);
    }
    if (dateRange.end) {
      res = res.filter(f => new Date(f.date_facture) <= dateRange.end!);
    }
    if (searchFacture) {
      res = res.filter(f => f.numero_facture?.toLowerCase().includes(searchFacture.toLowerCase()));
    }
    return res;
  }, [factures, selectedClientId, dateRange, searchFacture]);

  // Stats recalculées sur les factures filtrées uniquement
  const totalFacture = filteredFactures.reduce((sum, f) => sum + (f.montant_ttc || 0), 0);
  const totalPaye = filteredFactures.reduce(
    (sum, f) => sum + ((f.versements ?? []).reduce((sv, v) => sv + (v.montant || 0), 0)),
    0
  );
  const totalImpayé = totalFacture - totalPaye;

  // Export/print handlers
  const handlePrint = () => {
    window.print();
  };
  const handleExportPDF = () => {
    // TODO: Implémenter export PDF selon les filtres appliqués
    alert('Export PDF non implémenté');
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <UnpaidInvoicesHeader 
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
      />

      <UnpaidInvoicesFilters
        clients={clients}
        selectedClientId={selectedClientId}
        onClientSelect={setSelectedClientId}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchFacture={searchFacture}
        onSearchFactureChange={setSearchFacture}
      />

      <UnpaidInvoicesStats
        totalFacture={totalFacture}
        totalPaye={totalPaye}
        totalImpayé={totalImpayé}
      />

      <UnpaidInvoicesTable
        filteredFactures={filteredFactures}
        searchFacture={searchFacture}
        onSearchFactureChange={setSearchFacture}
      />
    </div>
  );
};

export default UnpaidInvoicesReports;
