import React from 'react';
import { useDiagnosticOperations } from '@/hooks/useDiagnosticOperations';
import RefreshButtons from './actions/RefreshButtons';

interface ArticleMarginTableActionsProps {
  isLoading: boolean;
}

const ArticleMarginTableActions = ({ isLoading }: ArticleMarginTableActionsProps) => {
  const {
    handleDiagnosticFraisCalculation,
    handleRefreshData,
    handleForceRefreshView
  } = useDiagnosticOperations();

  return (
    <div className="flex justify-end gap-2 flex-wrap">
      <RefreshButtons
        isLoading={isLoading}
        onRefreshData={handleRefreshData}
        onForceRefreshView={handleForceRefreshView}
      />
    </div>
  );
};

export default ArticleMarginTableActions;