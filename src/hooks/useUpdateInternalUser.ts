
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  return useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      console.log('🔄 Updating internal user:', userData.id);
      
      // Utiliser la fonction SQL sécurisée pour la mise à jour
      const { data, error } = await supabase.rpc('update_user_profile', {
        p_user_id: userData.id,
        p_prenom: userData.prenom,
        p_nom: userData.nom,
        p_email: userData.email,
        p_telephone: userData.telephone,
        p_adresse: userData.adresse,
        p_photo_url: userData.photo_url,
        p_matricule: userData.matricule,
        p_statut: userData.statut,
        p_doit_changer_mot_de_passe: userData.doit_changer_mot_de_passe
      });

      if (error) {
        console.error('❌ Error updating user:', error);
        throw error;
      }

      console.log('✅ User updated successfully');
      return data;
    },
    onSuccess: () => {
      // Invalider toutes les requêtes liées aux utilisateurs
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      
      toast({
        title: "Utilisateur modifié",
        description: "Les informations de l'utilisateur ont été mises à jour avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error updating user:', error);
      
      let errorMessage = "Impossible de modifier l'utilisateur";
      
      if (error.message?.includes('Permission denied')) {
        errorMessage = "Vous n'avez pas les droits nécessaires pour modifier cet utilisateur";
      } else if (error.message?.includes('insufficient privileges')) {
        errorMessage = "Privilèges insuffisants pour cette opération";
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
