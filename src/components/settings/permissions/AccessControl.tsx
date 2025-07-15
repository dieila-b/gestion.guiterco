
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/components/auth/AuthContext';
import { useUserPermissions, useUsersWithRoles, useRoles, useAssignUserRole } from '@/hooks/usePermissions';
import { Shield, Check, X, AlertCircle, Users } from 'lucide-react';

const AccessControl = () => {
  const { user, utilisateurInterne } = useAuth();
  const { data: userPermissions = [], isLoading: permissionsLoading } = useUserPermissions(user?.id);
  const { data: usersWithRoles = [], isLoading: usersLoading, error: usersError } = useUsersWithRoles();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const assignUserRole = useAssignUserRole();

  const handleRoleAssignment = async (userId: string, roleId: string) => {
    try {
      await assignUserRole.mutateAsync({ userId, roleId });
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  // Grouper les permissions par menu
  const groupedPermissions = (userPermissions as any[]).reduce((acc, permission) => {
    const menuName = permission.menu || 'Général';
    if (!acc[menuName]) {
      acc[menuName] = [];
    }
    acc[menuName].push(permission);
    return acc;
  }, {} as Record<string, any[]>);

  const getPermissionTypeColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'bg-green-100 text-green-800';
      case 'write':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isLoading = permissionsLoading || usersLoading || rolesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les utilisateurs : {usersError.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Contrôle d'Accès</h3>
        <p className="text-sm text-muted-foreground">
          Gérez les rôles des utilisateurs et consultez vos permissions
        </p>
      </div>

      {/* Informations utilisateur actuel */}
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

      {/* Gestion des rôles utilisateurs */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <div>
              <CardTitle>Gestion des Rôles Utilisateurs</CardTitle>
              <CardDescription>
                Assignez des rôles aux utilisateurs du système
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle Actuel</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersWithRoles.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.prenom} {user.nom}</p>
                      <p className="text-sm text-muted-foreground">{user.type_compte}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role?.nom || 'Aucun rôle'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.statut === 'actif' ? 'default' : 'secondary'}>
                      {user.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={user.role_id || ''} 
                      onValueChange={(roleId) => handleRoleAssignment(user.user_id, roleId)}
                      disabled={assignUserRole.isPending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Choisir un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vos permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Vos Permissions</CardTitle>
          <CardDescription>
            Liste détaillée de vos permissions par menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.entries(groupedPermissions).length > 0 ? (
            Object.entries(groupedPermissions).map(([menuName, permissions]) => (
              <div key={menuName} className="mb-6 last:mb-0">
                <h4 className="font-medium mb-3 capitalize">{menuName}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(permissions as any[]).map((permission: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <Badge 
                        variant="outline"
                        className={getPermissionTypeColor(permission.action)}
                      >
                        {permission.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune permission trouvée</h3>
              <p className="text-muted-foreground">
                Contactez votre administrateur pour obtenir des permissions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé des accès */}
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
              {['read', 'write', 'delete'].map((action) => {
                const actionPermissions = (userPermissions as any[]).filter(p => p.action === action);
                const moduleCount = new Set(actionPermissions.map(p => p.menu)).size;
                
                return (
                  <TableRow key={action}>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={getPermissionTypeColor(action)}
                      >
                        {action}
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
