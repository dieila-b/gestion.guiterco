
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
        // Obtenir le token d'authentification actuel
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('Session non valide. Veuillez vous reconnecter.');
        }

        // Appeler l'Edge Function pour mettre à jour le mot de passe
        const { data, error } = await supabase.functions.invoke('admin-update-password', {
          body: {
            userId,
            newPassword,
            requireChange
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          console.error('❌ Edge function error:', error);
          throw new Error(`Erreur lors de l'appel à la fonction: ${error.message}`);
        }

        if (!data.success) {
          console.error('❌ Password update failed:', data.error);
          throw new Error(data.error || 'Échec de la mise à jour du mot de passe');
        }

        console.log('✅ Password updated successfully via Edge Function');
        return { 
          success: true, 
          requiresManualReset: requireChange 
        };

      } catch (error: any) {
        console.error('💥 Critical error in password update:', error);
        
        // Messages d'erreur spécifiques
        let errorMessage = 'Impossible de mettre à jour le mot de passe.';
        
        if (error.message?.includes('Session non valide')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.message?.includes('Insufficient permissions')) {
          errorMessage = 'Permissions insuffisantes pour cette opération.';
        } else if (error.message?.includes('User not found')) {
          errorMessage = 'Utilisateur non trouvé dans le système.';
        } else if (error.message?.includes('Missing userId')) {
          errorMessage = 'Identifiant utilisateur manquant.';
        } else if (error.message?.includes('Failed to update password')) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
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
