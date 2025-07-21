
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePasswordUpdate = () => {
  const { toast } = useToast();

  const updatePassword = useMutation({
    mutationFn: async ({ userId, newPassword, requireChange }: { 
      userId: string; 
      newPassword: string; 
      requireChange: boolean 
    }) => {
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: {
          userId,
          newPassword,
          requireChange
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Mot de passe mis à jour",
        description: "Le mot de passe a été changé avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors du changement de mot de passe:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de changer le mot de passe",
        variant: "destructive",
      });
    }
  });

  return { 
    updatePassword: updatePassword.mutateAsync,
    isLoading: updatePassword.isPending 
  };
};
