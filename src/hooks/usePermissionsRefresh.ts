
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const usePermissionsRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const refreshAllData = async () => {
    if (isRefreshing) {
      console.log('🚫 Actualisation déjà en cours, annulation...');
      return;
    }
    
    console.log('🔄 Début de l\'actualisation complète...');
    setIsRefreshing(true);
    
    try {
      // Invalider tous les caches liés aux permissions
      const queries = [
        'roles',
        'permissions', 
        'all-role-permissions',
        'role-permissions',
        'menus-permissions-structure',
        'user-permissions',
        'users-with-roles'
      ];

      console.log('🗑️ Invalidation des caches:', queries);
      
      // Invalider tous les caches en parallèle
      await Promise.all(
        queries.map(queryKey => 
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        )
      );
      
      // Forcer le refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['roles'] }),
        queryClient.refetchQueries({ queryKey: ['permissions'] }),
        queryClient.refetchQueries({ queryKey: ['all-role-permissions'] })
      ]);
      
      console.log('✅ Actualisation terminée avec succès');
      toast.success('Données actualisées avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation:', error);
      toast.error('Erreur lors de l\'actualisation des données');
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    refreshAllData
  };
};
