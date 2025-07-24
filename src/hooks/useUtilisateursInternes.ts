import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UtilisateurInterne {
  id: string;
  user_id?: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  matricule?: string;
  role_id?: string;
  adresse_complete?: string;
  photo_url?: string;
  statut: 'actif' | 'inactif';
  doit_changer_mot_de_passe: boolean;
  created_at: string;
  updated_at: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateUtilisateurInterneData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  telephone?: string;
  role_id: string; // Maintenant requis
  adresse_complete?: string;
  photo_url?: string;
  doit_changer_mot_de_passe?: boolean;
}

export interface UpdateUtilisateurInterneData {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  role_id?: string;
  adresse_complete?: string;
  photo_url?: string;
  statut?: 'actif' | 'inactif';
  doit_changer_mot_de_passe?: boolean;
}

export const useUtilisateursInternes = () => {
  return useQuery({
    queryKey: ['utilisateurs-internes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:roles(id, name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UtilisateurInterne[];
    }
  });
};

export const useCreateUtilisateurInterne = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateUtilisateurInterneData) => {
      console.log('📝 Création utilisateur interne via Edge Function:', data);
      
      // Appel à l'Edge Function pour créer l'utilisateur avec compte Supabase Auth
      const { data: result, error } = await supabase.functions.invoke('create-internal-user', {
        body: {
          email: data.email,
          password: data.password,
          prenom: data.prenom,
          nom: data.nom,
          role_id: data.role_id,
          telephone: data.telephone
        }
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw new Error(error.message || 'Erreur lors de la création de l\'utilisateur');
      }

      if (result?.error) {
        console.error('❌ Erreur création utilisateur:', result.error);
        throw new Error(result.error);
      }

      console.log('✅ Utilisateur créé via Edge Function:', result);
      return result.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur interne a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de l'utilisateur.",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateUtilisateurInterne = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUtilisateurInterneData }) => {
      const { data: userData, error } = await supabase
        .from('utilisateurs_internes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return userData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur modifié",
        description: "L'utilisateur interne a été modifié avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification de l'utilisateur.",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteUtilisateurInterne = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('utilisateurs_internes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur interne a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression de l'utilisateur.",
        variant: "destructive",
      });
    }
  });
};