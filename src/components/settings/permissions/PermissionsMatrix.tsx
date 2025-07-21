
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionsMatrixProps {
  canManage: boolean;
}

export function PermissionsMatrix({ canManage }: PermissionsMatrixProps) {
  const { permissions, roles, loading } = usePermissions();
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    // Group permissions by menu
    const grouped = permissions.reduce((acc, permission) => {
      const key = permission.menu;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(permission);
      return acc;
    }, {} as Record<string, any[]>);

    setGroupedPermissions(grouped);
  }, [permissions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'write':
        return 'bg-green-100 text-green-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Matrice des Permissions</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Total: {permissions.length} permissions</span>
          <span>•</span>
          <span>{roles.length} rôles</span>
        </div>
      </div>

      <div className="grid gap-4">
        {Object.entries(groupedPermissions).map(([menu, menuPermissions]) => (
          <Card key={menu}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{menu}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {menuPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {permission.submenu ? `${permission.submenu}` : 'Général'}
                        </span>
                        <Badge variant="outline" className={getActionColor(permission.action)}>
                          {permission.action}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {permissions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucune permission définie
        </div>
      )}
    </div>
  );
}
