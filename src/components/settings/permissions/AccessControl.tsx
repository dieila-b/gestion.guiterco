
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/components/auth/AuthContext';
import { useUserPermissions } from '@/hooks/usePermissions';
import { Shield, Check, X } from 'lucide-react';

const AccessControl = () => {
  const { user, utilisateurInterne } = useAuth();
  const { data: userPermissions } = useUserPermissions(user?.id);

  // Grouper les permissions par module
  const groupedPermissions = userPermissions?.reduce((acc, permission) => {
    const moduleName = permission.module_nom;
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(permission);
    return acc;
  }, {} as Record<string, any[]>);

  const getPermissionTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-green-100 text-green-800';
      case 'ecriture':
        return 'bg-blue-100 text-blue-800';
      case 'suppression':
        return 'bg-red-100 text-red-800';
      case 'administration':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Contrôle d'Accès</h3>
        <p className="text-sm text-muted-foreground">
          Vos permissions actuelles et contrôle des accès
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Informations Utilisateur</CardTitle>
              <CardDescription>
                Vos informations de rôle et statut actuel
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nom</label>
              <p className="text-sm">
                {utilisateurInterne?.prenom} {utilisateurInterne?.nom}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Rôle</label>
              <Badge variant="outline" className="capitalize">
                {utilisateurInterne?.role?.nom}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vos Permissions</CardTitle>
          <CardDescription>
            Liste détaillée de vos permissions par module
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.entries(groupedPermissions || {}).map(([moduleName, permissions]) => (
            <div key={moduleName} className="mb-6 last:mb-0">
              <h4 className="font-medium mb-3 capitalize">{moduleName}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {permissions.map((permission, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <Badge 
                      variant="outline"
                      className={getPermissionTypeColor(permission.type_permission)}
                    >
                      {permission.type_permission}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résumé des Accès</CardTitle>
          <CardDescription>
            Vue d'ensemble de vos droits d'accès par type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type de Permission</TableHead>
                <TableHead>Modules Autorisés</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {['lecture', 'ecriture', 'suppression', 'administration'].map((type) => {
                const typePermissions = userPermissions?.filter(p => p.type_permission === type) || [];
                const moduleCount = new Set(typePermissions.map(p => p.module_nom)).size;
                
                return (
                  <TableRow key={type}>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={getPermissionTypeColor(type)}
                      >
                        {type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {moduleCount > 0 ? `${moduleCount} module(s)` : 'Aucun'}
                    </TableCell>
                    <TableCell>
                      {moduleCount > 0 ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControl;
