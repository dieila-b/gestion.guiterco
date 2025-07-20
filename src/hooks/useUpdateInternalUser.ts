
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecureUserOperations } from './useSecureUserOperations';

interface UpdateUserData {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  matricule?: string;
  statut: string;
  doit_changer_mot_de_passe: boolean;
}

export const useUpdateInternalUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { refreshSession, securePasswordUpdate } = useSecureUserOperations();

  return useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      console.log('🔄 Updating internal user with secure methods:', userData.id);
      
      try {
        // 1. Renouveler la session avant toute opération
        await refreshSession.mutateAsync();
        
        // 2. Mettre à jour les paramètres de mot de passe de façon sécurisée si nécessaire
        const { data: currentUser } = await supabase
          .from('utilisateurs_internes')
          .select('doit_changer_mot_de_passe, user_id')
          .eq('id', userData.id)
          .single();
        
        if (currentUser && currentUser.doit_changer_mot_de_passe !== userData.doit_changer_mot_de_passe) {
          await securePasswordUpdate.mutateAsync({
            targetUserId: currentUser.user_id,
            forceChange: userData.doit_changer_mot_de_passe
          });
        }
        
        // 3. Mettre à jour les autres informations du profil
        const { data, error } = await supabase
          .from('utilisateurs_internes')
          .update({
            prenom: userData.prenom,
            nom: userData.nom,
            email: userData.email,
            telephone: userData.telephone,
            adresse: userData.adresse,
            photo_url: userData.photo_url,
            matricule: userData.matricule,
            statut: userData.statut,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating user profile:', error);
          throw error;
        }

        console.log('✅ User updated successfully with secure methods');
        return data;
        
      } catch (error: any) {
        console.error('❌ Secure user update failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalider toutes les requêtes liées aux utilisateurs
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      
      toast({
        title: "Utilisateur modifié",
        description: "Les informations de l'utilisateur ont été mises à jour de manière sécurisée.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error updating user:', error);
      
      let errorMessage = "Impossible de modifier l'utilisateur";
      
      if (error.message?.includes('session')) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (error.message?.includes('row-level security')) {
        errorMessage = "Permissions insuffisantes pour cette opération";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });
};
