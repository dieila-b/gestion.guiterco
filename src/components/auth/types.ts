
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
