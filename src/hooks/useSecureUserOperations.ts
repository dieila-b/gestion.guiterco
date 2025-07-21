
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook pour les opérations sécurisées sur les utilisateurs
export const useSecureUserOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fonction pour renouveler la session
  const refreshSession = useMutation({
    mutationFn: async () => {
      console.log('🔄 Refreshing user session...');
      
      const { data, error } = await supabase.rpc('refresh_user_session');
      
      if (error) {
        console.error('❌ Error refreshing session:', error);
        throw error;
      }
      
      console.log('✅ Session refreshed:', data);
      return data;
    },
    onError: (error: any) => {
      console.error('❌ Session refresh failed:', error);
      toast({
        title: "Erreur de session",
        description: "Impossible de renouveler la session. Veuillez vous reconnecter.",
        variant: "destructive",
      });
    }
  });

  // Fonction pour mise à jour sécurisée du mot de passe
  const securePasswordUpdate = useMutation({
    mutationFn: async ({ 
      targetUserId, 
      forceChange 
    }: { 
      targetUserId: string; 
      forceChange: boolean; 
    }) => {
      console.log('🔒 Secure password update for:', targetUserId);
      
      // Renouveler la session avant l'opération
      await refreshSession.mutateAsync();
      
      const { data, error } = await supabase.rpc('secure_password_update', {
        target_user_id: targetUserId,
        new_password: '', // Placeholder - le vrai mot de passe sera géré séparément
        force_change: forceChange
      });
      
      if (error) {
        console.error('❌ Error updating password settings:', error);
        throw error;
      }
      
      console.log('✅ Password settings updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Paramètres de mot de passe mis à jour",
        description: "Les paramètres ont été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Password update failed:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les paramètres du mot de passe.",
        variant: "destructive",
      });
    }
  });

  // Fonction pour assignation sécurisée de rôle
  const secureRoleAssignment = useMutation({
    mutationFn: async ({ 
      targetUserId, 
      newRoleId 
    }: { 
      targetUserId: string; 
      newRoleId: string; 
    }) => {
      console.log('🔐 Secure role assignment:', { targetUserId, newRoleId });
      
      // Renouveler la session avant l'opération
      await refreshSession.mutateAsync();
      
      const { data, error } = await supabase.rpc('secure_role_assignment', {
        target_user_id: targetUserId,
        new_role_id: newRoleId
      });
      
      if (error) {
        console.error('❌ Error assigning role:', error);
        throw error;
      }
      
      console.log('✅ Role assigned successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      
      toast({
        title: "Rôle assigné",
        description: "Le rôle a été assigné avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Role assignment failed:', error);
      toast({
        title: "Erreur d'assignation de rôle",
        description: error.message || "Impossible d'assigner le rôle.",
        variant: "destructive",
      });
    }
  });

  // Fonction de diagnostic du système
  const systemDiagnostic = useMutation({
    mutationFn: async () => {
      console.log('🔍 Running system diagnostic...');
      
      const { data, error } = await supabase.rpc('diagnostic_user_system_complet');
      
      if (error) {
        console.error('❌ Diagnostic error:', error);
        throw error;
      }
      
      console.log('📊 System diagnostic results:', data);
      return data;
    }
  });

  return {
    refreshSession,
    securePasswordUpdate,
    secureRoleAssignment,
    systemDiagnostic
  };
};
