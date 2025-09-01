
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserPermissions, UserPermission } from '@/hooks/useUserPermissions';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, User, Shield, Eye, Edit, Trash2 } from 'lucide-react';

export const UserPermissionsDisplay: React.FC = () => {
  const { permissions, isLoading } = useUserPermissions();
  const { utilisateurInterne, user } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Mes Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Chargement des permissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const menuKey = permission.menu;
    if (!acc[menuKey]) {
      acc[menuKey] = {};
    }
    
    const submenuKey = permission.submenu || 'Principal';
    if (!acc[menuKey][submenuKey]) {
      acc[menuKey][submenuKey] = [];
    }
    
    acc[menuKey][submenuKey].push(permission);
    return acc;
  }, {} as Record<string, Record<string, UserPermission[]>>);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="w-3 h-3" />;
      case 'write':
        return <Edit className="w-3 h-3" />;
      case 'delete':
        return <Trash2 className="w-3 h-3" />;
      default:
        return <Shield className="w-3 h-3" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'read':
        return 'Lecture';
      case 'write':
        return 'Écriture';
      case 'delete':
        return 'Suppression';
      default:
        return action;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Mes Permissions
        </CardTitle>
        {utilisateurInterne && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            {utilisateurInterne.prenom} {utilisateurInterne.nom}
            <Badge variant="outline">{utilisateurInterne.role?.name || utilisateurInterne.role?.nom}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {permissions.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            Aucune permission accordée
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([menu, submenus]) => (
              <div key={menu} className="space-y-2">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  📁 {menu}
                </h4>
                <div className="ml-4 space-y-2">
                  {Object.entries(submenus).map(([submenu, menuPermissions]) => (
                    <div key={`${menu}-${submenu}`}>
                      {submenu !== 'Principal' && (
                        <h5 className="font-medium text-sm text-muted-foreground mb-1">
                          📂 {submenu}
                        </h5>
                      )}
                      <div className="flex flex-wrap gap-2 ml-4">
                        {menuPermissions.map((permission, index) => (
                          <Badge 
                            key={`${permission.menu}-${permission.submenu}-${permission.action}-${index}`}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {getActionIcon(permission.action)}
                            {getActionLabel(permission.action)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
