import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useResetUserPassword = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔄 Réinitialisation du mot de passe pour l\'utilisateur:', userId);
      
      const { data: result, error } = await supabase.functions.invoke('reset-user-password', {
        body: { userId }
      });

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
      console.log('✅ Mot de passe réinitialisé avec succès:', data);
      
      const user = data.result;
      const tempPassword = user.tempPassword;
      
      toast({
        title: "Mot de passe réinitialisé",
        description: `Nouveau mot de passe pour ${user.email}: ${tempPassword}`,
        duration: 10000, // 10 secondes pour avoir le temps de noter
      });

      // Afficher les informations de connexion dans la console pour référence
      console.log('📋 INFORMATIONS DE CONNEXION:');
      console.log(`Email: ${user.email}`);
      console.log(`Mot de passe temporaire: ${tempPassword}`);
      console.log(`Utilisateur: ${user.prenom} ${user.nom}`);
      console.log(`Statut: ${user.status}`);

      // Invalider la liste des utilisateurs pour rafraîchir
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
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