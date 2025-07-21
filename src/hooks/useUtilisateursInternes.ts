
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UtilisateurInterne {
  id: string;
  user_id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  matricule?: string;
  role_id?: string;
  role?: {
    id: string;
    name: string;
  };
  statut: string;
  type_compte: string;
  date_embauche?: string;
  doit_changer_mot_de_passe: boolean;
  created_at: string;
  updated_at: string;
}

export const useUtilisateursInternes = () => {
  return useQuery({
    queryKey: ['utilisateurs-internes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:roles(id, name)
        `)
        .order('nom', { ascending: true });
      
      if (error) throw error;
      return data as UtilisateurInterne[];
    }
  });
};

export const useRolesForUsers = () => {
  return useQuery({
    queryKey: ['roles-for-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      return data as { id: string; name: string; description?: string }[];
    }
  });
};
