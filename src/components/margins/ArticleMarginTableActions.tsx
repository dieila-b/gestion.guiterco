
import React from 'react';
import { useDiagnosticOperations } from '@/hooks/useDiagnosticOperations';
import DiagnosticButtons from './actions/DiagnosticButtons';
import RefreshButtons from './actions/RefreshButtons';
import DebugRepartitionButton from './actions/DebugRepartitionButton';

interface ArticleMarginTableActionsProps {
  isLoading: boolean;
}

const ArticleMarginTableActions = ({ isLoading }: ArticleMarginTableActionsProps) => {
  const {
    handleDiagnosticFraisCalculation,
    handleDebugVueMarges,
    handleDebugFrais,
    handleDebugRepartitionUnitaire,
    handleRefreshData,
    handleForceRefreshView
  } = useDiagnosticOperations();

  return (
    <div className="flex justify-end gap-2 flex-wrap">
      <DiagnosticButtons
        isLoading={isLoading}
        onDiagnosticFraisCalculation={handleDiagnosticFraisCalculation}
        onDebugVueMarges={handleDebugVueMarges}
        onDebugFrais={handleDebugFrais}
      />
      <DebugRepartitionButton
        isLoading={isLoading}
        onDebugRepartition={handleDebugRepartitionUnitaire}
      />
      <RefreshButtons
        isLoading={isLoading}
        onRefreshData={handleRefreshData}
        onForceRefreshView={handleForceRefreshView}
      />
    </div>
  );
};

export default ArticleMarginTableActions;
