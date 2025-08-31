
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissionsSystem';

export default function PermissionsTab() {
  const { data: permissions = [], isLoading } = usePermissions();

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
  }, {} as Record<string, Record<string, typeof permissions>>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Gestion des Permissions
            </CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Permission
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([menu, submenus]) => (
              <div key={menu} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">📁 {menu}</h3>
                
                {Object.entries(submenus).map(([submenu, menuPermissions]) => (
                  <div key={`${menu}-${submenu}`} className="ml-4">
                    {submenu !== 'Principal' && (
                      <h4 className="text-md font-medium text-muted-foreground mb-2">
                        📂 {submenu}
                      </h4>
                    )}
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {menuPermissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              <Badge 
                                variant={
                                  permission.action === 'read' ? 'default' : 
                                  permission.action === 'write' ? 'secondary' : 
                                  'destructive'
                                }
                              >
                                {permission.action === 'read' && '👁️'} 
                                {permission.action === 'write' && '✏️'} 
                                {permission.action === 'delete' && '🗑️'}
                                {' '}
                                {permission.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {permission.description || 'Aucune description'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
