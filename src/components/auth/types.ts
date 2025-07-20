
import { User, Session } from '@supabase/supabase-js';

export interface UtilisateurInterne {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  statut: string;
  type_compte: string;
  role: {
    name: string;  // Changé de 'nom' à 'name' pour correspondre à la table roles
    description: string;
  };
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  utilisateurInterne: UtilisateurInterne | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isInternalUser: boolean;
  isDevMode: boolean;
}
