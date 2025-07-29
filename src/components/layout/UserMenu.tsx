
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { Link } from 'react-router-dom';

const UserMenu = () => {
  const { utilisateurInterne, signOut, user, isInternalUser } = useAuth();

  // En production, vérifier à la fois utilisateurInterne ET isInternalUser
  // En développement, être plus permissif
  const shouldShowMenu = utilisateurInterne || (user && isInternalUser);
  
  console.log('UserMenu - État:', {
    hasUtilisateurInterne: !!utilisateurInterne,
    hasUser: !!user,
    isInternalUser,
    shouldShowMenu
  });

  if (!shouldShowMenu) {
    console.log('UserMenu - Menu non affiché, conditions non remplies');
    return null;
  }

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

  const isAdmin = (displayUser.role?.name || displayUser.role?.nom) === 'Administrateur' || displayUser.type_compte === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={displayUser.photo_url || ''} 
              alt={`${displayUser.prenom} ${displayUser.nom}`} 
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
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
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </Link>
          </DropdownMenuItem>
        )}
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
  );
};

export default UserMenu;
