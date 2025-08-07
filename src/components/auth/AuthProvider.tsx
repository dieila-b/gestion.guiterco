
import React from 'react';
import { useDevMode } from '@/hooks/useDevMode';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { bypassAuth, mockUser: originalMockUser, isDevMode } = useDevMode();
  
  // Générer un UUID valide pour l'utilisateur mock avec rôle admin complet
  const validMockUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // UUID valide fixe
  
  // Créer un utilisateur mock avec des permissions administrateur complètes
  const mockUser = {
    ...originalMockUser,
    id: validMockUserId,
    role: {
      id: 'admin-role-dev',
      nom: 'Super Administrateur Dev',
      name: 'Super Administrateur Dev',
      description: 'Rôle administrateur de développement avec accès complet'
    },
    statut: 'actif' as const,
    type_compte: 'admin' as const
  };
  
  console.log('🚀 AuthProvider - Configuration:', {
    isDevMode,
    bypassAuth,
    mockUserId: mockUser.id,
    mockUserRole: mockUser.role.nom
  });
  
  const authState = useAuthState(bypassAuth, mockUser, isDevMode);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};
