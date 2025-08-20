
import React from 'react';
import { useDevMode } from '@/hooks/useDevMode';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { bypassAuth, mockUser: originalMockUser, isDevMode } = useDevMode();
  
  // Ensure the mock user has the required id property in role
  const mockUser = {
    ...originalMockUser,
    role: {
      ...originalMockUser.role,
      id: 'mock-role-id'
    }
  };
  
  const authState = useAuthState(bypassAuth, mockUser, isDevMode);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};
