
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserRoleAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔄 Assignation rôle simple depuis useUserRoleAssignment:', { userId, roleId });
      
      const { data, error } = await supabase.rpc('assign_user_role_simple', {
        p_user_id: userId,
        p_role_id: roleId === 'no-role' ? null : roleId
      });
      
      if (error) {
        console.error('❌ Erreur assignation rôle:', error);
        throw error;
      }
      
      console.log('✅ Rôle assigné avec succès depuis useUserRoleAssignment');
      return data;
    },
    onSuccess: () => {
      // Invalider toutes les requêtes liées aux utilisateurs et rôles
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-users'] });
      
      toast({
        title: "Rôle assigné avec succès",
        description: "Le rôle a été assigné avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erreur assignation rôle depuis useUserRoleAssignment:', error);
      toast({
        title: "Erreur d'assignation de rôle",
        description: error.message || "Impossible d'assigner le rôle.",
        variant: "destructive",
      });
    }
  });

  return { assignRole };
};
