
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

const PermissionsManagement = () => {
  const { data: permissions, isLoading, error } = usePermissions();

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'read':
        return 'secondary';
      case 'write':
        return 'default';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'write':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      default:
        return <Key className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les permissions : {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Grouper les permissions par menu
  const groupedPermissions = permissions?.reduce((acc, permission) => {
    const menuKey = permission.menu;
    if (!acc[menuKey]) {
      acc[menuKey] = [];
    }
    acc[menuKey].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Gestion des Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Liste détaillée des permissions par menu et sous-menu
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedPermissions || {}).map(([menuName, menuPermissions]) => (
          <Card key={menuName}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <CardTitle className="text-base">{menuName}</CardTitle>
                <Badge variant="outline">
                  {menuPermissions.length} permission{menuPermissions.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menuPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {permission.submenu ? `${permission.submenu} →` : ''} {permission.action}
                        </span>
                        <Badge variant={getActionBadgeVariant(permission.action)}>
                          {getActionIcon(permission.action)}
                          <span className="ml-1 capitalize">{permission.action}</span>
                        </Badge>
                      </div>
                      {permission.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!permissions || permissions.length === 0) && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune permission trouvée</h3>
            <p className="text-muted-foreground">
              Les permissions sont gérées automatiquement par le système
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PermissionsManagement;
