
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UtilisateurInterne {
  id: string;
  user_id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  poste: string | null;
  statut: string;
  date_embauche: string | null;
  adresse: string | null;
  photo_url: string | null;
  doit_changer_mot_de_passe: boolean;
  created_at: string;
  updated_at: string;
  role?: {
    id: string;
    name: string;
    description: string | null;
    is_system: boolean;
  };
}

export interface UtilisateurInterneWithRole extends UtilisateurInterne {
  role: {
    id: string;
    name: string;
    description: string | null;
    is_system: boolean;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
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
          user_roles!inner (
            role_id,
            is_active,
            roles (
              id,
              name,
              description,
              is_system
            )
          )
        `)
        .eq('user_roles.is_active', true)
        .order('nom, prenom');
      
      if (error) throw error;
      
      // Transformer les données pour avoir un format plus simple
      const transformedData = data?.map(user => ({
        id: user.id,
        user_id: user.user_id,
        matricule: user.matricule,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        poste: user.poste || null,
        statut: user.statut,
        date_embauche: user.date_embauche || null,
        adresse: user.adresse,
        photo_url: user.photo_url,
        doit_changer_mot_de_passe: user.doit_changer_mot_de_passe,
        created_at: user.created_at,
        updated_at: user.updated_at,
        role: user.user_roles && user.user_roles.length > 0 && user.user_roles[0].roles 
          ? user.user_roles[0].roles 
          : null
      })) || [];
      
      return transformedData as UtilisateurInterne[];
    }
  });
};

export const useRolesForUsers = () => {
  return useQuery({
    queryKey: ['roles-for-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Role[];
    }
  });
};
