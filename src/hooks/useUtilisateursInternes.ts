
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UtilisateurInterneWithRole {
  id: string;
  user_id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  role_id: string;
  statut: string;
  type_compte: string;
  doit_changer_mot_de_passe: boolean;
  created_at: string;
  updated_at: string;
  role?: {
    id: string;
    nom: string;
    description?: string;
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
          role:role_id (
            id,
            nom,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UtilisateurInterneWithRole[];
    }
  });
};
