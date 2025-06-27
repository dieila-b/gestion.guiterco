
import { useState } from 'react';
import { usePrecommandeAlerts } from '@/hooks/precommandes/usePrecommandeAlerts';

export const useBonLivraisonValidation = () => {
  const [pendingValidation, setPendingValidation] = useState<{
    articleId: string;
    onConfirm: () => void;
  } | null>(null);

  const { data: alertInfo } = usePrecommandeAlerts(pendingValidation?.articleId);

  const checkPrecommandesBeforeValidation = (articleId: string, onConfirm: () => void) => {
    setPendingValidation({ articleId, onConfirm });
  };

  const confirmValidation = () => {
    if (pendingValidation) {
      pendingValidation.onConfirm();
      setPendingValidation(null);
    }
  };

  const cancelValidation = () => {
    setPendingValidation(null);
  };

  return {
    alertInfo,
    showAlert: !!pendingValidation && !!alertInfo && alertInfo.reste_a_livrer > 0,
    checkPrecommandesBeforeValidation,
    confirmValidation,
    cancelValidation
  };
};
