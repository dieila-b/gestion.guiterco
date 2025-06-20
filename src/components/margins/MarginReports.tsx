
import React, { useState } from 'react';
import { useArticlesWithMargins, useFacturesWithMargins, useRapportMargePeriode } from '@/hooks/useMargins';
import MarginStatsCards from './MarginStatsCards';
import MarginReportsHeader from './MarginReportsHeader';
import MarginReportsTabs from './MarginReportsTabs';

const MarginReports = () => {
  const [dateDebut, setDateDebut] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dateFin, setDateFin] = useState<Date>(new Date());

  const { data: articles, isLoading: articlesLoading } = useArticlesWithMargins();
  const { data: factures, isLoading: facturesLoading } = useFacturesWithMargins();
  const { data: rapport, isLoading: rapportLoading } = useRapportMargePeriode(dateDebut, dateFin);

  return (
    <div className="space-y-6">
      <MarginReportsHeader
        dateDebut={dateDebut}
        dateFin={dateFin}
        onDateDebutChange={setDateDebut}
        onDateFinChange={setDateFin}
      />

      {rapport && (
        <MarginStatsCards rapport={rapport} isLoading={rapportLoading} />
      )}

      <MarginReportsTabs
        articles={articles || []}
        factures={factures || []}
        articlesLoading={articlesLoading}
        facturesLoading={facturesLoading}
      />
    </div>
  );
};

export default MarginReports;
