
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdatePasswordData {
  userId: string;
  newPassword: string;
}

interface UpdatePasswordResult {
  success: boolean;
  requiresManualReset?: boolean;
  error?: string;
}

export const usePasswordUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updatePassword = async (data: UpdatePasswordData): Promise<UpdatePasswordResult> => {
    setIsLoading(true);
    console.log('🔄 Tentative de mise à jour du mot de passe pour:', data.userId);

    try {
      // Approche 1: Tenter d'utiliser l'API admin si disponible
      const { error: adminError } = await supabase.auth.admin.updateUserById(
        data.userId,
        { password: data.newPassword }
      );

      if (!adminError) {
        console.log('✅ Mot de passe mis à jour via API Admin');
        toast({
          title: "Succès",
          description: "Le mot de passe a été mis à jour avec succès",
        });
        return { success: true, requiresManualReset: false };
      }

      // Si l'API admin échoue, utiliser une approche alternative
      console.log('⚠️ API Admin non disponible, tentative avec approche alternative');
      
      // Approche 2: Marquer l'utilisateur pour qu'il change son mot de passe à la prochaine connexion
      const { error: updateError } = await supabase
        .from('utilisateurs_internes')
        .update({ 
          doit_changer_mot_de_passe: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', data.userId);

      if (updateError) {
        throw new Error(`Erreur de mise à jour: ${updateError.message}`);
      }

      // Approche 3: Créer une demande de réinitialisation de mot de passe
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        // Nous devons récupérer l'email de l'utilisateur d'abord
        await getUserEmail(data.userId),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      );

      if (resetError) {
        console.warn('Impossible d\'envoyer l\'email de réinitialisation:', resetError);
      }

      toast({
        title: "Demande de changement enregistrée",
        description: "L'utilisateur devra changer son mot de passe à la prochaine connexion. Un email de réinitialisation a été envoyé si possible.",
        variant: "default",
      });

      return { success: true, requiresManualReset: true };

    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe:', error);
      
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le mot de passe. Veuillez réessayer ou contacter l'administrateur.",
        variant: "destructive",
      });

      return { success: false, requiresManualReset: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePassword,
    isLoading
  };
};

// Fonction helper pour récupérer l'email d'un utilisateur
const getUserEmail = async (userId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('utilisateurs_internes')
    .select('email')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    throw new Error('Impossible de récupérer l\'email de l\'utilisateur');
  }
  
  return data.email;
};
