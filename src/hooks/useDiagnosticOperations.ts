import { useDiagnosticFraisCalculation } from './diagnostics/useDiagnosticFraisCalculation';
import { useDebugVueMarges } from './diagnostics/useDebugVueMarges';
import { useRefreshOperations } from './diagnostics/useRefreshOperations';

export const useDiagnosticOperations = () => {
  const { handleDiagnosticFraisCalculation } = useDiagnosticFraisCalculation();
  const { handleDebugVueMarges } = useDebugVueMarges();
  const { handleRefreshData, handleForceRefreshView } = useRefreshOperations();

  return {
    handleDiagnosticFraisCalculation,
    handleDebugVueMarges,
    handleRefreshData,
    handleForceRefreshView
  };
};
