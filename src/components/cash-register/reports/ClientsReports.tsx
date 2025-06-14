
import React, { useState } from 'react';
import { useClientsQuery, useFacturesVenteQuery } from '@/hooks/useSalesQueries'; // Corrected import
import ClientReportFilter from './ClientReportFilter';
import ClientReportActions from './ClientReportActions';
import SelectedClientReport from './SelectedClientReport';
import AllClientsReportTable from './AllClientsReportTable';
import type { FactureVente, Client } from '@/types/sales';


interface ClientStat {
  client: Client;
  totalFactures: number;
  totalCA: number;
  facturesPayees: number;
  facturesEnRetard: number;
  facturesRecentes: FactureVente[];
}

const ClientsReports: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [showResults, setShowResults] = useState(false);

  const { data: clients } = useClientsQuery();
  const { data: factures } = useFacturesVenteQuery();

  const clientStats: ClientStat[] = clients?.map(client => {
    const clientFactures = factures?.filter(f => f.client_id === client.id) || [];
    const totalCA = clientFactures.reduce((sum, f) => sum + f.montant_ttc, 0);
    const facturesPayees = clientFactures.filter(f => f.statut_paiement === 'payee');
    const facturesEnRetard = clientFactures.filter(f => {
      if (!f.date_echeance) return false;
      return new Date(f.date_echeance) < new Date() && f.statut_paiement !== 'payee';
    });

    // Ensure facturesRecentes is always an array, even if clientFactures is empty
    const facturesRecentes = clientFactures.length > 0 ? clientFactures.slice(-5) : [];
    
    return {
      client,
      totalFactures: clientFactures.length,
      totalCA,
      facturesPayees: facturesPayees.length,
      facturesEnRetard: facturesEnRetard.length,
      facturesRecentes
    };
  }).sort((a, b) => b.totalCA - a.totalCA) || [];

  const selectedClientData = selectedClient !== 'all' ? 
    clientStats.find(stat => stat.client.id === selectedClient) : null;

  const handleGenerateReport = () => {
    setShowResults(true);
  };

  const handleExportPDF = () => {
    console.log('Export PDF rapport clients');
    // Placeholder for PDF export logic
  };

  const handleExportExcel = () => {
    console.log('Export Excel rapport clients');
    // Placeholder for Excel export logic
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClientReportFilter
          selectedClient={selectedClient}
          onSelectedClientChange={setSelectedClient}
          clients={clients}
        />
      </div>

      <ClientReportActions
        showResults={showResults}
        onGenerateReport={handleGenerateReport}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />

      {showResults && (
        <div className="space-y-4">
          {selectedClientData ? (
            <SelectedClientReport clientData={selectedClientData} />
          ) : (
            <AllClientsReportTable clientStats={clientStats} />
          )}
        </div>
      )}
    </div>
  );
};

export default ClientsReports;
