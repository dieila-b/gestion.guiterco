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
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';

interface UserMenuProps {
  user?: any;
}

const UserMenu = ({ user: propUser }: UserMenuProps) => {
  const { signOut, user: authUser } = useAuth();
  const { profile } = useProfile();

  const user = propUser || authUser;

  // Utiliser les données du profil ou données par défaut
  const displayUser = {
    prenom: profile?.prenom || user?.user_metadata?.prenom || user?.user_metadata?.first_name || 'Utilisateur',
    nom: profile?.nom || user?.user_metadata?.nom || user?.user_metadata?.last_name || '',
    email: user?.email || '',
    photo_url: profile?.avatar_url || user?.user_metadata?.avatar_url
  };

  const initials = displayUser.prenom && displayUser.nom 
    ? `${displayUser.prenom.charAt(0)}${displayUser.nom.charAt(0)}`.toUpperCase()
    : displayUser.email?.charAt(0).toUpperCase() || 'U';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={displayUser.photo_url || ''} 
              alt={`${displayUser.prenom} ${displayUser.nom}`} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
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
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;