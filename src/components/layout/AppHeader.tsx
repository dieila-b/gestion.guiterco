
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserMenu from './UserMenu';
import { useAuth } from '@/components/auth/AuthContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { user } = useAuth();

  // Afficher toujours un profil utilisateur par défaut
  const defaultUser = {
    email: 'utilisateur@guitierco.com',
    user_metadata: {
      prenom: 'Utilisateur',
      nom: 'GuIterCo'
    }
  };

  const displayUser = user || defaultUser;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <UserMenu user={displayUser} />
      </div>
    </header>
  );
}
