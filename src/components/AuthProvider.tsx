
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDevMode } from '@/hooks/useDevMode';

const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { isDevMode, bypassAuth, mockUser } = useDevMode();
  const [devAuthState, setDevAuthState] = useState(null);

  useEffect(() => {
    if (isDevMode && bypassAuth) {
      console.log('🚀 AuthProvider: Mode dev avec bypass activé, injection de l\'utilisateur mock');
      
      // Créer un état d'authentification mock pour le développement
      const mockAuthState = {
        ...auth,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            prenom: mockUser.prenom,
            nom: mockUser.nom
          },
          app_metadata: {
            role: mockUser.role.nom
          }
        },
        loading: false,
        internalUser: {
          id: mockUser.id,
          user_id: mockUser.id,
          matricule: 'DEV-01',
          prenom: mockUser.prenom,
          nom: mockUser.nom,
          email: mockUser.email,
          telephone: '+33123456789',
          adresse: 'Adresse de développement',
          photo_url: null,
          role_id: 'admin-role-id',
          statut: mockUser.statut,
          type_compte: mockUser.type_compte,
          doit_changer_mot_de_passe: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: mockUser.role
        }
      };
      
      setDevAuthState(mockAuthState);
    } else {
      setDevAuthState(null);
    }
  }, [isDevMode, bypassAuth, mockUser]);

  // Utiliser l'état mock en mode dev avec bypass, sinon l'état normal
  const contextValue = (isDevMode && bypassAuth && devAuthState) ? devAuthState : auth;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
