
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SecureUserUpdateData {
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

export const useSecureUserManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation pour l'assignation sécurisée de rôle
  const assignRoleSecure = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔐 Assignation sécurisée de rôle:', { userId, roleId });
      
      const { data, error } = await supabase.rpc('assign_user_role_secure', {
        target_user_id: userId,
        new_role_id: roleId === 'no-role' ? null : roleId
      });
      
      if (error) {
        console.error('❌ Erreur assignation rôle:', error);
        throw error;
      }
      
      console.log('✅ Assignation rôle réussie:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      
      toast({
        title: "Rôle assigné avec succès",
        description: "Le rôle utilisateur a été mis à jour.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erreur assignation rôle:', error);
      toast({
        title: "Erreur d'assignation de rôle",
        description: error.message || "Impossible d'assigner le rôle",
        variant: "destructive",
      });
    }
  });

  // Mutation pour la mise à jour sécurisée d'utilisateur
  const updateUserSecure = useMutation({
    mutationFn: async ({ userInternalId, userData }: { userInternalId: string; userData: SecureUserUpdateData }) => {
      console.log('🔐 Mise à jour sécurisée utilisateur:', { userInternalId, userData });
      
      const { data, error } = await supabase.rpc('update_internal_user_secure', {
        user_internal_id: userInternalId,
        user_data: userData
      });
      
      if (error) {
        console.error('❌ Erreur mise à jour utilisateur:', error);
        throw error;
      }
      
      console.log('✅ Mise à jour utilisateur réussie:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      
      toast({
        title: "Utilisateur mis à jour",
        description: "Les informations ont été sauvegardées avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erreur mise à jour utilisateur:', error);
      toast({
        title: "Erreur de mise à jour",
        description: error.message || "Impossible de mettre à jour l'utilisateur",
        variant: "destructive",
      });
    }
  });

  // Mutation pour mise à jour du mot de passe
  const updatePasswordSecure = useMutation({
    mutationFn: async ({ authUserId, newPassword }: { authUserId: string; newPassword: string }) => {
      console.log('🔐 Mise à jour sécurisée mot de passe:', { authUserId });
      
      const { data, error } = await supabase.auth.admin.updateUserById(authUserId, {
        password: newPassword
      });
      
      if (error) {
        console.error('❌ Erreur mise à jour mot de passe:', error);
        throw error;
      }
      
      console.log('✅ Mise à jour mot de passe réussie');
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Mot de passe mis à jour",
        description: "Le nouveau mot de passe a été défini avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erreur mise à jour mot de passe:', error);
      toast({
        title: "Erreur de mot de passe",
        description: error.message || "Impossible de mettre à jour le mot de passe",
        variant: "destructive",
      });
    }
  });

  // Mutation pour mise à jour de l'email dans auth
  const updateEmailSecure = useMutation({
    mutationFn: async ({ authUserId, newEmail }: { authUserId: string; newEmail: string }) => {
      console.log('🔐 Mise à jour sécurisée email:', { authUserId, newEmail });
      
      const { data, error } = await supabase.auth.admin.updateUserById(authUserId, {
        email: newEmail
      });
      
      if (error) {
        console.error('❌ Erreur mise à jour email:', error);
        throw error;
      }
      
      console.log('✅ Mise à jour email réussie');
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Email mis à jour",
        description: "L'adresse email a été mise à jour avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erreur mise à jour email:', error);
      toast({
        title: "Erreur email",
        description: error.message || "Impossible de mettre à jour l'email",
        variant: "destructive",
      });
    }
  });

  return {
    assignRoleSecure,
    updateUserSecure,
    updatePasswordSecure,
    updateEmailSecure
  };
};
