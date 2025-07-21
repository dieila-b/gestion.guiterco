
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordUpdateData {
  userId: string;
  newPassword: string;
  requireChange?: boolean;
}

export const usePasswordUpdate = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: PasswordUpdateData) => {
      console.log('🔐 Updating password for user:', data.userId);

      const { error } = await supabase.functions.invoke('update-user-password', {
        body: {
          userId: data.userId,
          newPassword: data.newPassword,
          requireChange: data.requireChange || false
        }
      });

      if (error) {
        console.error('❌ Error updating password:', error);
        throw error;
      }

      console.log('✅ Password updated successfully');
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Mot de passe mis à jour",
        description: "Le mot de passe a été modifié avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error in password update:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le mot de passe",
        variant: "destructive",
      });
    }
  });

  return {
    updatePassword: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error
  };
};
