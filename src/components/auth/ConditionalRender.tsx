
import React from 'react';
import { useStrictPermissions } from '@/hooks/useStrictPermissions';

interface ConditionalRenderProps {
  children: React.ReactNode;
  menu: string;
  submenu?: string | null;
  action?: string;
  fallback?: React.ReactNode;
  hide?: boolean; // Si true, ne rend rien au lieu d'afficher un message d'erreur
}

const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  menu,
  submenu = null,
  action = 'read',
  fallback = null,
  hide = false
}) => {
  const { hasPermission, isLoading } = useStrictPermissions();

  // Pendant le chargement, on cache par sécurité
  if (isLoading) {
    return null;
  }

  if (!hasPermission(menu, submenu, action)) {
    if (hide) {
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ConditionalRender;
