
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserRoleAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔨 Assigning unified role with upsert strategy:', { userId, roleId });
      
      try {
        // 1. Obtenir l'utilisateur actuel pour assigned_by
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        // 2. Utiliser un upsert pour gérer les rôles existants
        // D'abord, désactiver TOUS les autres rôles pour cet utilisateur
        const { error: deactivateError } = await supabase
          .from('user_roles')
          .update({ 
            is_active: false, 
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', userId)
          .neq('role_id', roleId); // Ne pas désactiver le rôle qu'on va assigner

        if (deactivateError) {
          console.error('❌ Error deactivating other roles:', deactivateError);
          throw new Error(`Erreur lors de la désactivation des autres rôles: ${deactivateError.message}`);
        }

        // 3. Utiliser upsert pour le rôle principal
        const { data, error } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role_id: roleId,
            is_active: true,
            assigned_at: new Date().toISOString(),
            assigned_by: currentUser?.id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,role_id', // Spécifier la contrainte sur laquelle faire l'upsert
            ignoreDuplicates: false // Forcer la mise à jour si existe déjà
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error upserting role:', error);
          throw new Error(`Erreur lors de l'assignation du rôle: ${error.message}`);
        }

        console.log('✅ Role assigned successfully with upsert:', data);
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
