
export interface Role {
  id: string;
  nom?: string;  // Support old format
  name?: string; // Support new format
  description: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role?: Role;
}

export interface UtilisateurInterne {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  matricule?: string; // Add matricule property
  role: Role;
  statut: string;
  type_compte: string;
  photo_url?: string;
  telephone?: string;
  date_embauche?: string;
  department?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: any;
  session: any;
  utilisateurInterne: UtilisateurInterne | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isInternalUser: boolean;
  isDevMode: boolean;
}
