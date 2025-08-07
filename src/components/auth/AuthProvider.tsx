
import React from 'react';
import { useDevMode } from '@/hooks/useDevMode';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { bypassAuth, mockUser: originalMockUser, isDevMode } = useDevMode();
  
  // Générer un UUID valide pour l'utilisateur mock
  const validMockUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // UUID valide fixe
  
  // Ensure the mock user has a valid UUID and required properties
  const mockUser = {
    ...originalMockUser,
    id: validMockUserId,
    role: {
      ...originalMockUser.role,
      id: 'mock-role-id'
    }
  };
  
  const authState = useAuthState(bypassAuth, mockUser, isDevMode);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};
