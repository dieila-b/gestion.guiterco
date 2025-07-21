
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

// Type for the raw Supabase response
interface SupabaseUserResponse {
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
  user_roles: Array<{
    role_id: string;
    is_active: boolean;
    roles: {
      id: string;
      name: string;
      description: string | null;
      is_system: boolean;
    } | null;
  }> | null;
}

export const useUtilisateursInternes = () => {
  return useQuery({
    queryKey: ['utilisateurs-internes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          id,
          user_id,
          matricule,
          nom,
          prenom,
          email,
          telephone,
          poste,
          statut,
          date_embauche,
          adresse,
          photo_url,
          doit_changer_mot_de_passe,
          created_at,
          updated_at,
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
      
      // Transform the data to match the expected interface
      const transformedData = (data as SupabaseUserResponse[])?.map(user => {
        // Get the first active role
        const userRole = user.user_roles && user.user_roles.length > 0 ? user.user_roles[0] : null;
        const roleData = userRole?.roles;
        
        return {
          id: user.id,
          user_id: user.user_id,
          matricule: user.matricule,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          poste: user.poste,
          statut: user.statut,
          date_embauche: user.date_embauche,
          adresse: user.adresse,
          photo_url: user.photo_url,
          doit_changer_mot_de_passe: user.doit_changer_mot_de_passe,
          created_at: user.created_at,
          updated_at: user.updated_at,
          role: roleData ? {
            id: roleData.id,
            name: roleData.name,
            description: roleData.description,
            is_system: roleData.is_system
          } : undefined
        };
      }) || [];
      
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
