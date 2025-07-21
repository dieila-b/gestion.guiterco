
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
  created_at: string;
  updated_at: string;
  role?: {
    id: string;
    name: string;
    description: string | null;
    is_system: boolean;
  };
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
      const transformedData = data.map(user => ({
        ...user,
        role: user.user_roles?.[0]?.roles || null
      }));
      
      return transformedData as UtilisateurInterne[];
    }
  });
};
