
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateInternalUserData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  role_id: string;
  statut: string;
  doit_changer_mot_de_passe: boolean;
}

export const useCreateInternalUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: CreateInternalUserData) => {
      console.log('🔄 Creating internal user via Edge Function...');

      const { data, error } = await supabase.functions.invoke('create-internal-user', {
        body: userData
      });

      if (error) {
        console.error('❌ Error from Edge Function:', error);
        throw error;
      }

      console.log('✅ Internal user created successfully');
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
      console.error('❌ Error creating internal user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
    }
  });
};
