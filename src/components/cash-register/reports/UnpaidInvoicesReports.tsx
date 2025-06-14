
import React, { useState } from 'react';
import { useFacturesVenteQuery } from '@/hooks/useSales';
import UnpaidInvoicesFilter from './UnpaidInvoicesFilter';
import UnpaidInvoicesActions from './UnpaidInvoicesActions';
import UnpaidInvoicesSummary from './UnpaidInvoicesSummary';
import UnpaidInvoicesTable from './UnpaidInvoicesTable';

const UnpaidInvoicesReports: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showResults, setShowResults] = useState(false);

  const { data: factures } = useFacturesVenteQuery();

  const unpaidFactures = factures?.filter(facture => 
    facture.statut_paiement !== 'payee'
  ) || [];

  const filteredFactures = unpaidFactures.filter(facture => {
    if (filterType === 'all') return true;
    if (filterType === 'overdue') {
      return facture.date_echeance && new Date(facture.date_echeance) < new Date();
    }
    if (filterType === 'partial') {
      return facture.statut_paiement === 'partiellement_payee';
    }
    if (filterType === 'pending') {
      return facture.statut_paiement === 'en_attente';
    }
    return true;
  });

  const totalUnpaid = filteredFactures.reduce((sum, f) => sum + f.montant_ttc, 0);
  const overdueFactures = filteredFactures.filter(f => 
    f.date_echeance && new Date(f.date_echeance) < new Date()
  );
  const totalOverdue = overdueFactures.reduce((sum, f) => sum + f.montant_ttc, 0);
  
  const recoveryRate = factures && factures.length > 0 
    ? ((factures.length - unpaidFactures.length) / factures.length * 100) 
    : 0;

  const handleGenerateReport = () => {
    setShowResults(true);
  };

  const handleExportPDF = () => {
    console.log('Export PDF factures impayées');
    // Placeholder for PDF export logic
  };

  const handleExportExcel = () => {
    console.log('Export Excel factures impayées');
    // Placeholder for Excel export logic
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UnpaidInvoicesFilter 
          filterType={filterType}
          onFilterTypeChange={setFilterType}
        />
      </div>

      <UnpaidInvoicesActions
        showResults={showResults}
        onGenerateReport={handleGenerateReport}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />

      {showResults && (
        <div className="space-y-4">
          <UnpaidInvoicesSummary
            totalUnpaid={totalUnpaid}
            filteredFacturesCount={filteredFactures.length}
            totalOverdue={totalOverdue}
            overdueFacturesCount={overdueFactures.length}
            recoveryRate={recoveryRate}
          />
          <UnpaidInvoicesTable factures={filteredFactures} />
        </div>
      )}
    </div>
  );
};

export default UnpaidInvoicesReports;
