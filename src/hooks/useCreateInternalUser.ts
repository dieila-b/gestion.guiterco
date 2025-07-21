
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCreateInternalUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: {
      prenom: string;
      nom: string;
      email: string;
      password: string;
      telephone?: string;
      adresse?: string;
      photo_url?: string;
      role_id: string;
      doit_changer_mot_de_passe: boolean;
      statut: string;
    }) => {
      // Appeler la fonction edge pour créer l'utilisateur
      const { data, error } = await supabase.functions.invoke('create-internal-user', {
        body: userData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur créé",
        description: "Le nouvel utilisateur interne a été créé avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création:', error);
      
      let errorMessage = "Impossible de créer l'utilisateur";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Un utilisateur avec cette adresse email existe déjà";
      } else if (error.message?.includes('Email already registered')) {
        errorMessage = "Cette adresse email est déjà utilisée";
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
