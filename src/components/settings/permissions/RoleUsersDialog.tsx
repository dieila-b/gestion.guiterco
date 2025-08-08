
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useUsersWithRoles } from '@/hooks/usePermissionsSystem';
import { Users, User, Mail, Hash } from 'lucide-react';

interface RoleUsersDialogProps {
  role: {
    id: string;
    name: string;
    description?: string;
    is_system?: boolean;
  };
  children: React.ReactNode;
}

const RoleUsersDialog = ({ role, children }: RoleUsersDialogProps) => {
  const { data: usersWithRoles = [], isLoading } = useUsersWithRoles();
  
  // Filtrer les utilisateurs pour ce rôle
  const roleUsers = usersWithRoles.filter(user => user.role?.id === role.id);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Utilisateurs du rôle "{role.name}"</span>
            <Badge variant="outline">{roleUsers.length} utilisateur(s)</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Chargement des utilisateurs...</span>
            </div>
          ) : roleUsers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun utilisateur assigné</h3>
                <p className="text-muted-foreground">
                  Ce rôle n'a pas encore d'utilisateurs assignés.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {roleUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm">
                            {user.prenom} {user.nom}
                          </h4>
                          <Badge 
                            variant={user.statut === 'actif' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {user.statut}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Hash className="h-3 w-3" />
                            <span>{user.matricule}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleUsersDialog;
