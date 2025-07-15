
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Users } from 'lucide-react';
import { useRolesUtilisateurs } from '@/hooks/useRolesUtilisateurs';
import EditRolePermissionsDialog from './EditRolePermissionsDialog';
import CreateRoleDialog from './CreateRoleDialog';
import AssignUsersToRoleDialog from './AssignUsersToRoleDialog';

const RolesManagement = () => {
  const { data: roles, isLoading } = useRolesUtilisateurs();

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'administrateur':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'employe':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getRoleDescription = (roleName: string) => {
    switch (roleName) {
      case 'administrateur':
        return 'Accès complet à toutes les fonctionnalités';
      case 'manager':
        return 'Gestion et supervision des opérations';
      case 'employe':
        return 'Accès limité aux fonctionnalités de base';
      default:
        return 'Rôle personnalisé';
    }
  };

  if (isLoading) {
    return <div>Chargement des rôles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gestion des Rôles</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les rôles utilisateurs et leurs permissions
          </p>
        </div>
        <CreateRoleDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles?.map((role) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base capitalize">{role.nom}</CardTitle>
                <Badge className={getRoleColor(role.nom)}>
                  {role.nom}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {role.description || getRoleDescription(role.nom)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-x-2">
                <AssignUsersToRoleDialog role={role}>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-1" />
                    Utilisateurs
                  </Button>
                </AssignUsersToRoleDialog>
                
                <EditRolePermissionsDialog role={role}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Permissions
                  </Button>
                </EditRolePermissionsDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RolesManagement;
