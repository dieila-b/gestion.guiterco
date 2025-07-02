
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePermissions, useModules, useTypesPermissions } from '@/hooks/usePermissions';
import { useRolesUtilisateurs } from '@/hooks/useRolesUtilisateurs';

const PermissionsMatrix = () => {
  const { data: permissions } = usePermissions();
  const { data: modules } = useModules();
  const { data: typesPermissions } = useTypesPermissions();
  const { data: roles } = useRolesUtilisateurs();

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
        <h3 className="text-lg font-medium">Matrice des Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Vue d'ensemble de toutes les permissions disponibles par module
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules?.map((module) => (
          <Card key={module.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base capitalize">
                {module.description}
              </CardTitle>
              <CardDescription>
                Module: {module.nom}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typesPermissions?.map((type) => {
                  const permission = permissions?.find(
                    p => p.module.id === module.id && p.type_permission.id === type.id
                  );
                  
                  return (
                    <div key={type.id} className="flex items-center justify-between">
                      <span className="text-sm">{type.description}</span>
                      {permission && (
                        <Badge 
                          variant="outline"
                          className={getPermissionTypeColor(type.nom)}
                        >
                          {type.nom}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions par Type</CardTitle>
          <CardDescription>
            Récapitulatif des types de permissions disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Nombre de permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typesPermissions?.map((type) => {
                const count = permissions?.filter(p => p.type_permission.id === type.id).length || 0;
                return (
                  <TableRow key={type.id}>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={getPermissionTypeColor(type.nom)}
                      >
                        {type.nom}
                      </Badge>
                    </TableCell>
                    <TableCell>{type.description}</TableCell>
                    <TableCell>{count}</TableCell>
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

export default PermissionsMatrix;
