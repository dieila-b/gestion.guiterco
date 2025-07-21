
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UtilisateurInterne {
  id: string;
  user_id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  matricule?: string;
  role_id?: string;
  statut: string;
  type_compte: string;
  date_embauche?: string;
  created_at: string;
  updated_at: string;
}

export const useUtilisateursInternes = () => {
  return useQuery({
    queryKey: ['utilisateurs-internes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select('*')
        .order('nom', { ascending: true });
      
      if (error) throw error;
      return data as UtilisateurInterne[];
    }
  });
};
