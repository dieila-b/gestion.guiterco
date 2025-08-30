
import React from 'react';
import { useDevMode } from '@/hooks/useDevMode';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';
import '@/utils/clearDevCache';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { bypassAuth, mockUser, isDevMode } = useDevMode();
  
  // Transformer le mockUser en UtilisateurInterne complet
  const mockUtilisateurInterne = {
    id: mockUser.id,
    email: mockUser.email,
    prenom: mockUser.user_metadata.prenom,
    nom: mockUser.user_metadata.nom,
    role: {
      id: mockUser.role.id,
      name: mockUser.role.name,
      nom: mockUser.role.name, // Compatibilité
      description: mockUser.role.description
    },
    statut: 'actif' as const,
    type_compte: 'admin' as const,
    photo_url: mockUser.user_metadata.avatar_url
  };
  
  const authState = useAuthState(bypassAuth, mockUtilisateurInterne, isDevMode);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};
