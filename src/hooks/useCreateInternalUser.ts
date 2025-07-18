
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateUserData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  role_id: string;
  doit_changer_mot_de_passe: boolean;
  statut?: string;
}

export const useCreateInternalUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log('🔄 Calling Edge Function to create user...', { email: userData.email });
      
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session non disponible');
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('create-internal-user', {
        body: userData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw error;
      }

      if (!data.success) {
        console.error('❌ User creation failed:', data.error);
        throw new Error(data.error || 'Échec de la création de l\'utilisateur');
      }

      console.log('✅ User created successfully via Edge Function');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur interne a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
      
      let errorMessage = "Impossible de créer l'utilisateur";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Un utilisateur avec cette adresse email existe déjà";
      } else if (error.message?.includes('Email already registered')) {
        errorMessage = "Cette adresse email est déjà utilisée";
      } else if (error.message?.includes('Insufficient permissions')) {
        errorMessage = "Permissions insuffisantes. Rôle administrateur requis.";
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = "Non autorisé. Veuillez vous reconnecter.";
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
