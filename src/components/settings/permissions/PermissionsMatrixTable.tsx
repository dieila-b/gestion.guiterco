
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grid3x3, RefreshCw, Eye, Edit, Trash2, Download, Upload, FileText, Check, X, Lock } from 'lucide-react';
import { useRoles, usePermissions, useAllRolePermissions, useUpdateRolePermission } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

export default function PermissionsMatrixTable() {
  const { data: roles = [], isLoading: rolesLoading, refetch: refetchRoles } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading, refetch: refetchPermissions } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading, refetch: refetchRolePermissions } = useAllRolePermissions();
  const updateRolePermission = useUpdateRolePermission();

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  const handleRefresh = () => {
    refetchRoles();
    refetchPermissions();
    refetchRolePermissions();
    toast.success('Données actualisées');
  };

  const handlePermissionChange = (roleId: string, permissionId: string, canAccess: boolean) => {
    updateRolePermission.mutate({
      roleId,
      permissionId,
      canAccess
    });
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    const rolePermission = rolePermissions.find(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    );
    return rolePermission?.can_access || false;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read': return <Eye className="w-3 h-3" />;
      case 'write': return <Edit className="w-3 h-3" />;
      case 'delete': return <Trash2 className="w-3 h-3" />;
      case 'validate': return <Check className="w-3 h-3" />;
      case 'cancel': return <X className="w-3 h-3" />;
      case 'export': return <Download className="w-3 h-3" />;
      case 'import': return <Upload className="w-3 h-3" />;
      case 'print': return <FileText className="w-3 h-3" />;
      case 'close': return <Lock className="w-3 h-3" />;
      default: return <Grid3x3 className="w-3 h-3" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'read': return 'Lecture';
      case 'write': return 'Écriture';
      case 'delete': return 'Suppression';
      case 'validate': return 'Validation';
      case 'cancel': return 'Annulation';
      case 'export': return 'Export';
      case 'import': return 'Import';
      case 'print': return 'Impression';
      case 'close': return 'Clôture';
      case 'reopen': return 'Réouverture';
      case 'transfer': return 'Transfert';
      case 'receive': return 'Réception';
      case 'deliver': return 'Livraison';
      case 'invoice': return 'Facturation';
      case 'payment': return 'Paiement';
      case 'convert': return 'Conversion';
      default: return action;
    }
  };

  // Grouper les permissions par menu et sous-menu
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const key = permission.submenu ? `${permission.menu} > ${permission.submenu}` : permission.menu;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as {[key: string]: typeof permissions});

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Matrice Complète des Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Chargement de la matrice complète...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeRoles = roles.filter(role => role.name); // Filtrer les rôles valides
  const totalPermissions = permissions.length;
  const groupCount = Object.keys(groupedPermissions).length;
  const activePermissionsCount = rolePermissions.filter(rp => rp.can_access).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Matrice Complète des Permissions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Gestion exhaustive des droits d'accès avec toutes les actions métier disponibles
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">{activeRoles.length}</Badge>
              <span className="font-medium">Rôles actifs</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50">{totalPermissions}</Badge>
              <span className="font-medium">Permissions totales</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50">{activePermissionsCount}</Badge>
              <span className="font-medium">Permissions accordées</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50">{groupCount}</Badge>
              <span className="font-medium">Modules couverts</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-80 sticky left-0 bg-muted/50 font-semibold">
                  Module / Fonctionnalité
                </TableHead>
                <TableHead className="w-40 font-semibold">Action</TableHead>
                {activeRoles.map((role) => (
                  <TableHead key={role.id} className="text-center min-w-32 font-semibold">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-medium">{role.name}</span>
                      {role.is_system && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          <Lock className="w-2 h-2 mr-1" />
                          Système
                        </Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                <React.Fragment key={groupName}>
                  <TableRow className="bg-muted/20">
                    <TableCell 
                      colSpan={2 + activeRoles.length} 
                      className="font-semibold py-3 sticky left-0 bg-muted/20"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        📁 {groupName}
                        <Badge variant="outline" className="ml-auto">
                          {groupPermissions.length} action(s)
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                  {groupPermissions
                    .sort((a, b) => {
                      // Ordonner les actions par priorité
                      const order = { 
                        read: 1, write: 2, delete: 3, validate: 4, cancel: 5,
                        convert: 6, export: 7, import: 8, print: 9, close: 10,
                        reopen: 11, transfer: 12, receive: 13, deliver: 14,
                        invoice: 15, payment: 16
                      };
                      return (order[a.action as keyof typeof order] || 99) - 
                             (order[b.action as keyof typeof order] || 99);
                    })
                    .map((permission) => (
                    <TableRow key={permission.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-8 sticky left-0 bg-background border-r">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {permission.description?.split(' - ')[0] || `${permission.menu}${permission.submenu ? ` > ${permission.submenu}` : ''}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {permission.menu}{permission.submenu ? ` → ${permission.submenu}` : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="border-r">
                        <Badge 
                          variant={permission.action === 'read' ? 'default' : 
                                 permission.action === 'write' ? 'secondary' : 
                                 permission.action === 'delete' ? 'destructive' : 'outline'}
                          className="text-xs flex items-center gap-1 w-fit"
                        >
                          {getActionIcon(permission.action)}
                          {getActionLabel(permission.action)}
                        </Badge>
                      </TableCell>
                      {activeRoles.map((role) => {
                        const hasAccess = hasPermission(role.id, permission.id);
                        const isSystemRole = role.is_system && role.name === 'Administrateur';
                        
                        return (
                          <TableCell key={role.id} className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={hasAccess}
                                onCheckedChange={(checked) => 
                                  !isSystemRole && handlePermissionChange(role.id, permission.id, checked as boolean)
                                }
                                disabled={isSystemRole || updateRolePermission.isPending}
                                className={hasAccess ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' : ''}
                              />
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPermissions === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Grid3x3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Aucune permission trouvée</h3>
            <p className="text-sm">Les permissions n'ont pas pu être chargées depuis la base de données</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
          <h4 className="font-medium mb-2 text-blue-900">ℹ️ Informations importantes :</h4>
          <ul className="space-y-1 text-blue-700">
            <li>• Le rôle <strong>Administrateur</strong> dispose automatiquement de toutes les permissions</li>
            <li>• Les permissions sont synchronisées en temps réel avec la base de données</li>
            <li>• Chaque module dispose d'actions granulaires selon son contexte métier</li>
            <li>• Les modifications prennent effet immédiatement pour les utilisateurs connectés</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
