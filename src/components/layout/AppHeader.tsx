
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserMenu from './UserMenu';
import { useAuth } from '@/components/auth/AuthContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { utilisateurInterne, user, isInternalUser } = useAuth();

  // Afficher le UserMenu si un utilisateur interne est connecté
  const shouldShowUserMenu = utilisateurInterne || (user && isInternalUser);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {shouldShowUserMenu && <UserMenu />}
      </div>
    </header>
  );
}
