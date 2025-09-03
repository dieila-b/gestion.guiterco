import { useAuth } from '@/components/auth/AuthContext';

export const useViewPermissions = () => {
  const { utilisateurInterne, isDevMode } = useAuth();

  const isRestrictedRole = () => {
    // En mode dev, on applique toujours les restrictions pour tester
    
    const roleName = utilisateurInterne?.role?.name || utilisateurInterne?.role?.nom;
    console.log('🔒 ViewPermissions Debug:', {
      isDevMode,
      utilisateurInterne,
      roleName,
      isVendeur: roleName?.toLowerCase() === 'vendeur',
      isCaissier: roleName?.toLowerCase() === 'caissier',
      isManager: roleName?.toLowerCase() === 'manager'
    });
    
    return roleName?.toLowerCase() === 'vendeur' || 
           roleName?.toLowerCase() === 'caissier' || 
           roleName?.toLowerCase() === 'manager';
  };

  const shouldBlurFinancialData = () => {
    const shouldBlur = isRestrictedRole();
    console.log('🔒 Should blur financial data:', shouldBlur);
    return shouldBlur;
  };

  return {
    isRestrictedRole,
    shouldBlurFinancialData
  };
};