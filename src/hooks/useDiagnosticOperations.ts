import { useDiagnosticFraisCalculation } from './diagnostics/useDiagnosticFraisCalculation';
import { useRefreshOperations } from './diagnostics/useRefreshOperations';

export const useDiagnosticOperations = () => {
  const { handleDiagnosticFraisCalculation } = useDiagnosticFraisCalculation();
  const { handleRefreshData, handleForceRefreshView } = useRefreshOperations();

  return {
    handleDiagnosticFraisCalculation,
    handleRefreshData,
    handleForceRefreshView
  };
};
