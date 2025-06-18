
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
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from 'react-router-dom';

const UserMenu = () => {
  const { utilisateurInterne, signOut } = useAuth();

  if (!utilisateurInterne) return null;

  const initials = `${utilisateurInterne.prenom.charAt(0)}${utilisateurInterne.nom.charAt(0)}`.toUpperCase();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrateur':
        return 'Administrateur';
      case 'employe':
        return 'Employé';
      case 'manager':
        return 'Manager';
      default:
        return role;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={utilisateurInterne.photo_url || ''} alt={`${utilisateurInterne.prenom} ${utilisateurInterne.nom}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {utilisateurInterne.prenom} {utilisateurInterne.nom}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {utilisateurInterne.email}
            </p>
            <p className="text-xs leading-none text-blue-600">
              {getRoleLabel(utilisateurInterne.role.nom)}
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
        {utilisateurInterne.role.nom === 'administrateur' && (
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
