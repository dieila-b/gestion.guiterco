
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, User } from 'lucide-react';

interface RoleUsersDialogProps {
  role: {
    id: string;
    name: string;
    description?: string;
  };
  children: React.ReactNode;
}

const RoleUsersDialog = ({ role, children }: RoleUsersDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Récupérer les utilisateurs ayant ce rôle via la fonction PostgreSQL optimisée
  const { data: usersWithRole = [], isLoading } = useQuery({
    queryKey: ['role-users', role.id],
    queryFn: async () => {
      console.log('🔍 Fetching users for role:', role.id, role.name);
      
      try {
        // Utiliser la fonction PostgreSQL optimisée
        const { data, error } = await supabase
          .rpc('get_users_by_role', { role_uuid: role.id });

        if (error) {
          console.error('❌ Error fetching users for role:', error);
          throw error;
        }

        console.log('✅ Users fetched via PostgreSQL function:', data?.length || 0);
        console.log('👥 Users details:', data);
        
        return data || [];
      } catch (error) {
        console.error('💥 Critical error fetching users for role:', error);
        throw error;
      }
    },
    enabled: isOpen
  });

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrateur':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'vendeur':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'caissier':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Utilisateurs avec le rôle "{role.name}"</span>
            <Badge variant="outline">{usersWithRole.length} utilisateur(s)</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {role.description && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Chargement...</span>
            </div>
          ) : usersWithRole.length > 0 ? (
            <div className="space-y-3">
              {usersWithRole.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.prenom} {user.nom}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getRoleColor(role.name)}>
                      {role.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {user.statut}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun utilisateur</h3>
              <p className="text-muted-foreground">
                Aucun utilisateur n'a actuellement le rôle "{role.name}"
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleUsersDialog;
