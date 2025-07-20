
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSimpleUserManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Assignation de rôle simplifiée
  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔄 Assignation rôle simple:', { userId, roleId });
      
      const { data, error } = await supabase.rpc('assign_user_role_simple', {
        p_user_id: userId,
        p_role_id: roleId === 'no-role' ? null : roleId
      });
      
      if (error) {
        console.error('❌ Erreur assignation rôle:', error);
        throw error;
      }
      
      console.log('✅ Rôle assigné avec succès');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle a été assigné avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erreur assignation rôle:', error);
      toast({
        title: "Erreur d'assignation",
        description: error.message || "Impossible d'assigner le rôle",
        variant: "destructive",
      });
    }
  });

  // Mise à jour utilisateur simplifiée
  const updateUser = useMutation({
    mutationFn: async ({ 
      userId, 
      prenom, 
      nom, 
      email, 
      telephone, 
      adresse, 
      photo_url, 
      matricule, 
      statut, 
      doit_changer_mot_de_passe 
    }: {
      userId: string;
      prenom: string;
      nom: string;
      email: string;
      telephone?: string;
      adresse?: string;
      photo_url?: string;
      matricule?: string;
      statut: string;
      doit_changer_mot_de_passe: boolean;
    }) => {
      console.log('🔄 Mise à jour utilisateur simple:', { userId });
      
      const { data, error } = await supabase.rpc('update_user_simple', {
        p_user_id: userId,
        p_prenom: prenom,
        p_nom: nom,
        p_email: email,
        p_telephone: telephone || null,
        p_adresse: adresse || null,
        p_photo_url: photo_url || null,
        p_matricule: matricule || null,
        p_statut: statut,
        p_doit_changer_mot_de_passe: doit_changer_mot_de_passe
      });
      
      if (error) {
        console.error('❌ Erreur mise à jour utilisateur:', error);
        throw error;
      }
      
      console.log('✅ Utilisateur mis à jour avec succès');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
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

  // Mise à jour du mot de passe
  const updatePassword = useMutation({
    mutationFn: async ({ authUserId, newPassword }: { authUserId: string; newPassword: string }) => {
      console.log('🔐 Mise à jour mot de passe:', { authUserId });
      
      const { data, error } = await supabase.auth.admin.updateUserById(authUserId, {
        password: newPassword
      });
      
      if (error) {
        console.error('❌ Erreur mise à jour mot de passe:', error);
        throw error;
      }
      
      console.log('✅ Mot de passe mis à jour avec succès');
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

  return {
    assignRole,
    updateUser,
    updatePassword
  };
};
