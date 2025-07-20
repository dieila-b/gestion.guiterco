
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserRoleAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔨 Assigning unified role with new structure:', { userId, roleId });
      
      try {
        // 1. Obtenir l'utilisateur actuel pour assigned_by
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        // 2. Désactiver tous les rôles existants pour cet utilisateur
        const { error: deactivateError } = await supabase
          .from('user_roles')
          .update({ 
            is_active: false, 
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', userId);

        if (deactivateError) {
          console.error('❌ Error deactivating existing roles:', deactivateError);
          throw new Error(`Erreur lors de la désactivation des rôles: ${deactivateError.message}`);
        }

        // 3. Assigner le nouveau rôle avec la nouvelle structure
        const { data, error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: roleId,
            is_active: true,
            assigned_at: new Date().toISOString(),
            assigned_by: currentUser?.id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error assigning new role:', error);
          throw new Error(`Erreur lors de l'assignation du rôle: ${error.message}`);
        }

        console.log('✅ Role assigned successfully with new structure:', data);
        return data;

      } catch (error: any) {
        console.error('❌ Critical error in role assignment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalider toutes les requêtes liées aux utilisateurs et rôles
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-users'] });
      
      toast({
        title: "Rôle assigné",
        description: "Le rôle a été assigné avec succès à l'utilisateur.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error assigning role:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner le rôle.",
        variant: "destructive",
      });
    }
  });

  return { assignRole };
};
