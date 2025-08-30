
import { useAuth } from '@/components/auth/AuthContext';
import { useUserPermissions } from './useUserPermissions';

export const useHasPermission = () => {
  const { utilisateurInterne } = useAuth();
  const { hasPermission, isLoading } = useUserPermissions(utilisateurInterne?.id);

  return {
    hasPermission,
    isLoading
  };
};
