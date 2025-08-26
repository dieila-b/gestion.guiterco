
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export const usePermissionsRefresh = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      // Invalider toutes les queries liées aux permissions
      await queryClient.invalidateQueries({ queryKey: ['roles'] });
      await queryClient.invalidateQueries({ queryKey: ['permissions'] });
      await queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      await queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      
      // Attendre que les nouvelles données soient chargées
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['roles'] }),
        queryClient.refetchQueries({ queryKey: ['permissions'] }),
        queryClient.refetchQueries({ queryKey: ['all-role-permissions'] }),
      ]);
      
      toast.success('Données actualisées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
      toast.error('Erreur lors de l\'actualisation des données');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return {
    refreshAllData,
    isRefreshing
  };
};
