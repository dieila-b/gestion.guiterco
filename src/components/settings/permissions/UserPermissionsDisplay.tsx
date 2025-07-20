
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface UserPermissionsDisplayProps {
  userId: string;
  userName: string;
  userRole: string;
}

const UserPermissionsDisplay = ({ userId, userName, userRole }: UserPermissionsDisplayProps) => {
  const { data: permissions = [], isLoading, error } = useUserPermissions(userId);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'write':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'write':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'delete':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Grouper les permissions par menu
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const key = permission.menu;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Permissions de {userName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <span>Erreur de chargement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Impossible de charger les permissions pour {userName}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Permissions Détaillées</span>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {permissions.length} permission(s)
          </Badge>
        </CardTitle>
        <CardDescription>
          Droits accordés à <strong>{userName}</strong> avec le rôle <strong>{userRole}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(groupedPermissions).length === 0 ? (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune permission</h3>
            <p className="text-muted-foreground">
              Cet utilisateur n'a aucune permission assignée
            </p>
          </div>
        ) : (
          Object.entries(groupedPermissions).map(([menu, menuPermissions]) => (
            <div key={menu} className="space-y-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-foreground">{menu}</h4>
                <Badge variant="secondary" className="text-xs">
                  {menuPermissions.length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-4">
                {menuPermissions.map((permission, index) => (
                  <div
                    key={`${permission.id}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-center space-x-2">
                      {getActionIcon(permission.action)}
                      <div>
                        <p className="text-sm font-medium">
                          {permission.submenu || permission.menu}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {permission.action}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getActionColor(permission.action)} text-xs`}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Accordé
                    </Badge>
                  </div>
                ))}
              </div>
              
              {Object.keys(groupedPermissions).indexOf(menu) < Object.keys(groupedPermissions).length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default UserPermissionsDisplay;
