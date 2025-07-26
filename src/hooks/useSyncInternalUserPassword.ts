import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncPasswordData {
  email: string;
  password: string;
}

export const useSyncInternalUserPassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SyncPasswordData) => {
      console.log('🔄 Synchronisation du mot de passe pour:', data.email);
      
      const { data: result, error } = await supabase.functions.invoke('sync-internal-users-passwords', {
        body: data
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw new Error(`Erreur lors de la synchronisation: ${error.message}`);
      }

      if (!result.success) {
        console.error('❌ Erreur réponse Edge Function:', result);
        throw new Error(result.error || 'Erreur lors de la synchronisation');
      }

      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Mot de passe synchronisé avec succès:', data);
      toast({
        title: "Succès",
        description: `Mot de passe synchronisé pour ${data.user_email}. Vous pouvez maintenant vous connecter.`,
      });
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la synchronisation:', error);
      toast({
        title: "Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};