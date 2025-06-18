
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserMenu from './UserMenu';
import { useAuth } from '@/components/auth/AuthContext';

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { isInternalUser } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        {isInternalUser && <UserMenu />}
      </div>
    </header>
  );
}
