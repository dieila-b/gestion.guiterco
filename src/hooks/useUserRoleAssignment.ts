
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecureUserOperations } from './useSecureUserOperations';

export const useUserRoleAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { secureRoleAssignment } = useSecureUserOperations();

  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔐 Using secure role assignment:', { userId, roleId });
      
      // Utiliser la fonction sécurisée pour l'assignation de rôle
      return await secureRoleAssignment.mutateAsync({
        targetUserId: userId,
        newRoleId: roleId
      });
    },
    onSuccess: () => {
      // Invalider toutes les requêtes liées aux utilisateurs et rôles
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-users'] });
      
      toast({
        title: "Rôle assigné avec succès",
        description: "Le rôle a été assigné de manière sécurisée.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Secure role assignment error:', error);
      toast({
        title: "Erreur d'assignation de rôle",
        description: error.message || "Impossible d'assigner le rôle avec la méthode sécurisée.",
        variant: "destructive",
      });
    }
  });

  return { assignRole };
};
