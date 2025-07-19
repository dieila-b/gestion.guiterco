
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UpdatePasswordResult {
  success: boolean;
  requiresManualReset: boolean;
}

export const usePasswordUpdate = () => {
  const { toast } = useToast();

  const updatePasswordMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      newPassword, 
      requireChange = false 
    }: { 
      userId: string; 
      newPassword: string; 
      requireChange?: boolean;
    }): Promise<UpdatePasswordResult> => {
      console.log('🔐 Updating password for user:', userId);
      
      try {
        // Mettre à jour le mot de passe via l'API Admin de Supabase
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        );

        if (passwordError) {
          console.error('❌ Error updating password:', passwordError);
          throw new Error(`Erreur lors de la mise à jour du mot de passe: ${passwordError.message}`);
        }

        // Mettre à jour le flag doit_changer_mot_de_passe dans utilisateurs_internes
        const { error: userError } = await supabase
          .from('utilisateurs_internes')
          .update({ 
            doit_changer_mot_de_passe: requireChange,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (userError) {
          console.error('❌ Error updating user flag:', userError);
          throw new Error(`Erreur lors de la mise à jour du profil utilisateur: ${userError.message}`);
        }

        console.log('✅ Password updated successfully');
        return { 
          success: true, 
          requiresManualReset: requireChange 
        };

      } catch (error: any) {
        console.error('💥 Critical error in password update:', error);
        throw error;
      }
    },
    onSuccess: (result: UpdatePasswordResult) => {
      toast({
        title: "Mot de passe mis à jour",
        description: result.requiresManualReset 
          ? "L'utilisateur devra changer son mot de passe à la prochaine connexion."
          : "Le mot de passe a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Password update failed:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le mot de passe.",
        variant: "destructive",
      });
    }
  });

  return { 
    updatePassword: updatePasswordMutation.mutateAsync,
    isLoading: updatePasswordMutation.isPending 
  };
};
