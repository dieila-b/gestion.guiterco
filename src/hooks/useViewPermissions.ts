import { useAuth } from '@/components/auth/AuthContext';

export const useViewPermissions = () => {
  const { utilisateurInterne, isDevMode } = useAuth();

  const isRestrictedRole = () => {
    if (isDevMode) return false; // En mode dev, pas de restriction
    
    const roleName = utilisateurInterne?.role?.name || utilisateurInterne?.role?.nom;
    return roleName?.toLowerCase() === 'vendeur' || roleName?.toLowerCase() === 'caissier';
  };

  const shouldBlurFinancialData = () => {
    return isRestrictedRole();
  };

  return {
    isRestrictedRole,
    shouldBlurFinancialData
  };
};