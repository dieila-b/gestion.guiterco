import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFixExistingUsers = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🔧 Nettoyage des utilisateurs orphelins...');
      
      const { data: result, error } = await supabase.functions.invoke('fix-existing-users', {
        body: {}
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw new Error(`Erreur lors du nettoyage: ${error.message}`);
      }

      if (!result.success) {
        console.error('❌ Erreur réponse Edge Function:', result);
        throw new Error(result.error || 'Erreur lors du nettoyage');
      }

      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Nettoyage réussi:', data);
      toast({
        title: "Nettoyage terminé",
        description: `${data.deletedCount} utilisateur(s) orphelin(s) supprimé(s)`,
      });
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors du nettoyage:', error);
      toast({
        title: "Erreur de nettoyage",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};