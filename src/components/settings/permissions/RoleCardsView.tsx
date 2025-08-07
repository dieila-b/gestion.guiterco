
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Shield, User, Eye, Edit } from 'lucide-react';
import { useRoleCards } from '@/hooks/useRoleCards';
import RoleUsersDialog from './RoleUsersDialog';
import RolePermissionsDialog from './RolePermissionsDialog';

const getRoleIcon = (roleName: string) => {
  switch (roleName.toLowerCase()) {
    case 'administrateur':
      return Shield;
    case 'manager':
      return Settings;
    case 'caissier':
      return User;
    case 'vendeur':
      return Users;
    default:
      return User;
  }
};

const getRoleColor = (roleName: string) => {
  switch (roleName.toLowerCase()) {
    case 'administrateur':
      return 'bg-red-50 border-red-200 hover:bg-red-100';
    case 'manager':
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    case 'caissier':
      return 'bg-green-50 border-green-200 hover:bg-green-100';
    case 'vendeur':
      return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
    default:
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  }
};

const RoleCardsView = () => {
  const { data: roleCards = [], isLoading } = useRoleCards();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  const handleShowUsers = (role: any) => {
    setSelectedRole(role);
    setShowUsersDialog(true);
  };

  const handleManagePermissions = (role: any) => {
    setSelectedRole(role);
    setShowPermissionsDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement des rôles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Rôles et Permissions</h2>
          <p className="text-muted-foreground">
            Gérez les rôles utilisateurs et leurs permissions d'accès
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {roleCards.length} rôle(s)
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleCards.map((role) => {
          const IconComponent = getRoleIcon(role.name);
          const colorClass = getRoleColor(role.name);
          
          return (
            <Card key={role.id} className={`transition-all duration-200 ${colorClass}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-white/50">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {role.name}
                      </CardTitle>
                      {role.is_system && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Système
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {role.description}
                </CardDescription>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{role.userCount} utilisateur(s)</span>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleShowUsers(role)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir les utilisateurs
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleManagePermissions(role)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Gérer les permissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog pour afficher les utilisateurs */}
      {selectedRole && (
        <RoleUsersDialog
          role={selectedRole}
          open={showUsersDialog}
          onOpenChange={setShowUsersDialog}
        />
      )}

      {/* Dialog pour gérer les permissions */}
      {selectedRole && (
        <RolePermissionsDialog
          role={selectedRole}
          open={showPermissionsDialog}
          onOpenChange={setShowPermissionsDialog}
        />
      )}
    </div>
  );
};

export default RoleCardsView;
