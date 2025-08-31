
import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings,
  DollarSign,
  FileText,
  TrendingUp,
  CreditCard,
  LogOut,
  User
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const location = useLocation();
  const { utilisateurInterne, signOut, user, isInternalUser } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Tableau de bord', href: '/', menu: 'Dashboard' },
    { icon: ShoppingCart, label: 'Ventes', href: '/sales', menu: 'Ventes' },
    { icon: Package, label: 'Stocks', href: '/stocks', menu: 'Stocks' },
    { icon: CreditCard, label: 'Achats', href: '/purchases', menu: 'Achats' },
    { icon: Users, label: 'Clients', href: '/clients', menu: 'Clients' },
    { icon: DollarSign, label: 'Caisse', href: '/cash-registers', menu: 'Caisse' },
    { icon: TrendingUp, label: 'Marges', href: '/margins', menu: 'Marges' },
    { icon: FileText, label: 'Rapports', href: '/reports', menu: 'Rapports' },
    { icon: Settings, label: 'Paramètres', href: '/settings', menu: 'Paramètres' },
  ];

  // Utiliser les données disponibles (utilisateurInterne en priorité, sinon user)
  const displayUser = utilisateurInterne || {
    prenom: user?.user_metadata?.prenom || 'Utilisateur',
    nom: user?.user_metadata?.nom || '',
    email: user?.email || '',
    role: { nom: 'utilisateur', name: 'utilisateur' },
    type_compte: 'interne',
    photo_url: undefined
  };

  const initials = displayUser.prenom && displayUser.nom 
    ? `${displayUser.prenom.charAt(0)}${displayUser.nom.charAt(0)}`.toUpperCase()
    : displayUser.email?.charAt(0).toUpperCase() || 'U';

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'administrateur':
        return 'Administrateur';
      case 'employe':
      case 'caissier':
        return 'Employé';
      case 'manager':
        return 'Manager';
      case 'vendeur':
        return 'Vendeur';
      default:
        return role;
    }
  };

  const shouldShowProfile = utilisateurInterne || (user && isInternalUser);

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 h-full flex flex-col">
      <div className="p-6 border-b border-slate-700 bg-slate-800">
        <div className="bg-white rounded-lg p-3 flex items-center justify-center">
          <img 
            src="/lovable-uploads/8d272adb-358e-4d9a-b001-40ad2de9663b.png" 
            alt="GuIterCo - Commerce international Guinée" 
            className="h-16 w-full object-contain"
          />
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="mb-4">
          <p className="text-slate-400 text-sm mb-3">Menu principal</p>
        </div>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <PermissionGuard 
                  menu={item.menu} 
                  action="read"
                  mode="disable"
                  disabledClassName="opacity-50"
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </PermissionGuard>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profil utilisateur en bas de la sidebar */}
      {shouldShowProfile && (
        <div className="p-4 border-t border-slate-700">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 text-left"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={displayUser.photo_url || ''} 
                    alt={`${displayUser.prenom} ${displayUser.nom}`} 
                  />
                  <AvatarFallback className="bg-slate-600 text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {displayUser.prenom} {displayUser.nom}
                  </p>
                  <p className="text-slate-400 text-xs truncate">
                    {getRoleLabel((displayUser.role?.name || displayUser.role?.nom) || displayUser.type_compte)}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="top">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayUser.prenom} {displayUser.nom}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayUser.email}
                  </p>
                  <p className="text-xs leading-none text-blue-600">
                    {getRoleLabel((displayUser.role?.name || displayUser.role?.nom) || displayUser.type_compte)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Voir le profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
