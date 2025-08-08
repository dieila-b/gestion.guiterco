
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
    
    console.log('🔄 Début de l\'actualisation complète du système de permissions...');
    setIsRefreshing(true);
    
    try {
      // Invalider tous les caches liés aux permissions et à la structure
      const queries = [
        'roles',
        'permissions', 
        'all-role-permissions',
        'role-permissions',
        'menus-permissions-structure',
        'user-permissions',
        'users-with-roles',
        'menus-structure'
      ];

      console.log('🗑️ Invalidation des caches:', queries);
      
      // Invalider tous les caches en parallèle
      await Promise.all(
        queries.map(queryKey => 
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        )
      );
      
      // Forcer le refetch des données principales
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['roles'] }),
        queryClient.refetchQueries({ queryKey: ['permissions'] }),
        queryClient.refetchQueries({ queryKey: ['all-role-permissions'] }),
        queryClient.refetchQueries({ queryKey: ['menus-permissions-structure'] })
      ]);
      
      console.log('✅ Actualisation du système de permissions terminée avec succès');
      toast.success('Système de permissions actualisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation du système de permissions:', error);
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
