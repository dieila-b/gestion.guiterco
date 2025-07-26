import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useResetAllPasswords = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Réinitialisation de tous les mots de passe...');
      
      const { data: result, error } = await supabase.functions.invoke('reset-all-passwords');

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw new Error(`Erreur lors de la réinitialisation: ${error.message}`);
      }

      if (!result.success) {
        console.error('❌ Erreur réponse Edge Function:', result);
        throw new Error(result.error || 'Erreur lors de la réinitialisation');
      }

      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Mots de passe réinitialisés avec succès:', data);
      
      // Afficher les résultats détaillés
      const successCount = data.results.filter((r: any) => r.status !== 'error').length;
      const errorCount = data.results.filter((r: any) => r.status === 'error').length;
      
      let message = `${successCount} utilisateurs traités avec succès`;
      if (errorCount > 0) {
        message += `, ${errorCount} erreurs`;
      }
      
      toast({
        title: "Réinitialisation terminée",
        description: message,
      });

      // Log des mots de passe temporaires pour info (en développement)
      console.table(data.results.map((r: any) => ({
        email: r.email,
        status: r.status,
        tempPassword: r.tempPassword || 'N/A'
      })));
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la réinitialisation:', error);
      toast({
        title: "Erreur de réinitialisation",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};