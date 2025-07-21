
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssignRoleData {
  userId: string;
  roleId: string;
}

export const useUserRoleAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assignRole = useMutation({
    mutationFn: async (data: AssignRoleData) => {
      console.log('🔄 Assigning role to user:', data.userId, 'role:', data.roleId);

      const { error } = await supabase.rpc('assign_user_role_admin', {
        p_user_id: data.userId,
        p_role_id: data.roleId
      });

      if (error) {
        console.error('❌ Error assigning role:', error);
        throw error;
      }

      console.log('✅ Role assigned successfully');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle a été assigné avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error in role assignment:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner le rôle",
        variant: "destructive",
      });
    }
  });

  return {
    assignRole,
    isLoading: assignRole.isPending,
    error: assignRole.error
  };
};
