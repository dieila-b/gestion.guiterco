
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Users } from 'lucide-react';
import { useRolesUtilisateurs, useCreateUtilisateurInterne } from '@/hooks/useRolesUtilisateurs';
import { usePermissions, useRolePermissions } from '@/hooks/usePermissions';
import EditRolePermissionsDialog from './EditRolePermissionsDialog';

const RolesManagement = () => {
  const { data: roles, isLoading } = useRolesUtilisateurs();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'administrateur':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'employe':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau rôle
        </Button>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Utilisateurs actifs</span>
                </div>
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
