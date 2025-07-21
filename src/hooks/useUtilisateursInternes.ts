
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
  poste?: string;
  role_id?: string;
  role?: {
    id: string;
    name: string;
  } | null;
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
          user_roles!inner (
            role_id,
            is_active,
            roles!inner (
              id,
              name
            )
          )
        `)
        .order('nom', { ascending: true });
      
      if (error) {
        console.error('Error fetching utilisateurs internes:', error);
        throw error;
      }
      
      // Transformer les données pour correspondre à l'interface
      const transformedData: UtilisateurInterne[] = (data || []).map(user => ({
        id: user.id,
        user_id: user.user_id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse,
        photo_url: user.photo_url,
        matricule: user.matricule,
        poste: user.poste,
        role_id: user.user_roles?.[0]?.role_id,
        role: user.user_roles?.[0]?.roles ? {
          id: user.user_roles[0].roles.id,
          name: user.user_roles[0].roles.name
        } : null,
        statut: user.statut,
        type_compte: user.type_compte,
        date_embauche: user.date_embauche,
        doit_changer_mot_de_passe: user.doit_changer_mot_de_passe,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
      
      return transformedData;
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

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }
      
      return data as { id: string; name: string; description?: string }[];
    }
  });
};
