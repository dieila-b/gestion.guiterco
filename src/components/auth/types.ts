
import { User, Session } from '@supabase/supabase-js';

export interface UtilisateurInterne {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  matricule?: string; // Add matricule as optional
  statut: string;
  type_compte: string;
  doit_changer_mot_de_passe: boolean;
  role: {
    name: string;
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
