
import React from 'react';
import { useDevMode } from '@/hooks/useDevMode';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';
import '@/utils/clearDevCache'; // Auto-nettoyage du cache

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { bypassAuth, mockUser: originalMockUser, isDevMode } = useDevMode();
  
  // Ensure the mock user has the required id property in role and all necessary fields
  const mockUser = {
    ...originalMockUser,
    id: '00000000-0000-4000-8000-000000000001', // ID fixe pour l'utilisateur mock
    role: {
      ...originalMockUser.role,
      id: 'mock-role-id',
      name: 'Administrateur',
      nom: 'Administrateur' // Compatibility
    }
  };
  
  console.log('🔧 AuthProvider - Configuration:', {
    isDevMode,
    bypassAuth,
    mockUserId: mockUser.id,
    mockUserRole: mockUser.role.nom
  });
  
  const authState = useAuthState(bypassAuth, mockUser, isDevMode);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};
