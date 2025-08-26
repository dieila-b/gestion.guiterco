import { useDiagnosticFraisCalculation } from './diagnostics/useDiagnosticFraisCalculation';
import { useDebugVueMarges } from './diagnostics/useDebugVueMarges';
import { useDebugFrais } from './diagnostics/useDebugFrais';
import { useDebugRepartitionUnitaire } from './diagnostics/useDebugRepartitionUnitaire';
import { useRefreshOperations } from './diagnostics/useRefreshOperations';

export const useDiagnosticOperations = () => {
  const { handleDiagnosticFraisCalculation } = useDiagnosticFraisCalculation();
  const { handleDebugVueMarges } = useDebugVueMarges();
  const { handleDebugFrais } = useDebugFrais();
  const { handleDebugRepartitionUnitaire } = useDebugRepartitionUnitaire();
  const { handleRefreshData, handleForceRefreshView } = useRefreshOperations();

  return {
    handleDiagnosticFraisCalculation,
    handleDebugVueMarges,
    handleDebugFrais,
    handleDebugRepartitionUnitaire,
    handleRefreshData,
    handleForceRefreshView
  };
};
