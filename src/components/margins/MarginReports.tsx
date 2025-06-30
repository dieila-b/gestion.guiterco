
import React from 'react';
import { useArticlesWithMargins, useFacturesWithMargins } from '@/hooks/useMargins';
import MarginReportsTabs from './MarginReportsTabs';

const MarginReports = () => {
  const { data: articles, isLoading: articlesLoading } = useArticlesWithMargins();
  const { data: factures, isLoading: facturesLoading } = useFacturesWithMargins();

  return (
    <div className="space-y-6">
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
