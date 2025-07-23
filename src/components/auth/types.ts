
export interface Role {
  id: string;
  nom: string;
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
  role: Role;
  statut: string;
  type_compte: string;
  photo_url?: string; // Add optional photo_url property
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
