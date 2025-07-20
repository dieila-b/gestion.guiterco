
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useStrictPermissions } from '@/hooks/useStrictPermissions';

interface ProtectedMenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  menu: string;
  submenu?: string | null;
  action?: string;
}

const ProtectedMenuItem: React.FC<ProtectedMenuItemProps> = ({
  icon: Icon,
  label,
  href,
  menu,
  submenu = null,
  action = 'read'
}) => {
  const location = useLocation();
  const { hasPermission } = useStrictPermissions();
  const isActive = location.pathname === href;

  // Si l'utilisateur n'a pas la permission, ne pas afficher l'élément de menu
  if (!hasPermission(menu, submenu, action)) {
    return null;
  }

  return (
    <li>
      <Link
        to={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-slate-700 text-white"
            : "text-slate-300 hover:bg-slate-700 hover:text-white"
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    </li>
  );
};

export default ProtectedMenuItem;
