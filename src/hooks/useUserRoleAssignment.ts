
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserRoleAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      // Mettre à jour le rôle dans la table utilisateurs_internes
      const { error: updateError } = await supabase
        .from('utilisateurs_internes')
        .update({ role_id: roleId })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Gérer la table user_roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          is_active: true
        });

      if (insertError) throw insertError;

      return { userId, roleId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Rôle assigné",
        description: "Le rôle a été assigné avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'assignation du rôle:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner le rôle",
        variant: "destructive",
      });
    }
  });

  return { assignRole };
};
