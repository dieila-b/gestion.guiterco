
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserRoleAssignment = () => {
  const queryClient = useQueryClient();

  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔄 Assigning role:', { userId, roleId });
      
      // D'abord, désactiver tous les rôles actuels de l'utilisateur
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);
      
      // Puis assigner le nouveau rôle
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roleId,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error assigning role:', error);
        throw error;
      }
      
      console.log('✅ Role assigned successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast.success('Rôle assigné avec succès');
    },
    onError: (error: any) => {
      console.error('💥 Critical error in useUserRoleAssignment:', error);
      toast.error('Erreur lors de l\'assignation du rôle: ' + error.message);
    }
  });

  return { assignRole };
};
