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
  role_id?: string;
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
      // Créer directement l'utilisateur interne sans passer par Supabase Auth
      const { data: userData, error: userError } = await supabase
        .from('utilisateurs_internes')
        .insert({
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
          telephone: data.telephone,
          role_id: data.role_id,
          adresse_complete: data.adresse_complete,
          photo_url: data.photo_url,
          statut: 'actif', // Toujours actif par défaut
          doit_changer_mot_de_passe: data.doit_changer_mot_de_passe ?? true,
        })
        .select()
        .single();

      if (userError) throw userError;
      return userData;
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