
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  useRoles, 
  useRolePermissions, 
  useUpdateRolePermission,
  Role
} from '@/hooks/usePermissionsSystem';
import { useGroupedMenusStructure } from '@/hooks/useMenusStructure';
import { Settings, Eye, Edit, Trash2, Shield, Check, X, FileText, Download, Upload, AlertCircle, Lock } from 'lucide-react';

export default function MatrixTab() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: rolePermissions = [], isLoading: rpLoading } = useRolePermissions();
  const { data: menusStructure = [], isLoading: menusLoading } = useGroupedMenusStructure();
  const updateRolePermission = useUpdateRolePermission();

  const isLoading = rolesLoading || rpLoading || menusLoading;

  // Vérifier si un rôle a une permission
  const hasPermission = (roleId: string, menuNom: string, sousMenuNom: string | null, action: string) => {
    return rolePermissions.some(rp => 
      rp.role_id === roleId && 
      rp.permission_menu === menuNom &&
      rp.permission_submenu === sousMenuNom &&
      rp.permission_action === action &&
      rp.can_access
    );
  };

  // Basculer une permission pour un rôle
  const togglePermission = async (roleId: string, permissionId: string, currentValue: boolean) => {
    if (selectedRole?.is_system && selectedRole?.name === 'Administrateur') {
      return; // Empêcher la modification des permissions administrateur
    }
    
    await updateRolePermission.mutateAsync({
      roleId,
      permissionId,
      canAccess: !currentValue
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'write':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      case 'validate':
        return <Check className="h-3 w-3" />;
      case 'cancel':
        return <X className="h-3 w-3" />;
      case 'convert':
        return <FileText className="h-3 w-3" />;
      case 'export':
        return <Download className="h-3 w-3" />;
      case 'import':
        return <Upload className="h-3 w-3" />;
      default:
        return <Settings className="h-3 w-3" />;
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
      case 'validate':
        return 'Validation';
      case 'cancel':
        return 'Annulation';
      case 'convert':
        return 'Conversion';
      case 'export':
        return 'Export';
      case 'import':
        return 'Import';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'write':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delete':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'validate':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'cancel':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'convert':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'export':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'import':
        return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrateur':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'manager':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'vendeur':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'caissier':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const isAdminRole = selectedRole?.name === 'Administrateur' && selectedRole?.is_system;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement de la matrice...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Matrice des Permissions
        </h3>
        <p className="text-sm text-muted-foreground">
          Configurez les permissions par rôle et menu - Structure complète avec tous les types d'actions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Édition des Permissions par Rôle</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sélectionnez un rôle pour modifier ses permissions. Toutes les fonctionnalités de l'application sont représentées.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection des rôles */}
          <div>
            <h4 className="font-medium mb-4">Sélectionnez un rôle :</h4>
            <div className="flex flex-wrap gap-3">
              {roles.map((role) => (
                <Button
                  key={role.id}
                  variant={selectedRole?.id === role.id ? "default" : "outline"}
                  className={selectedRole?.id === role.id ? getRoleColor(role.name) : ""}
                  onClick={() => setSelectedRole(role)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {role.name}
                  {role.is_system && <Lock className="w-3 h-3 ml-1" />}
                </Button>
              ))}
            </div>
          </div>

          {/* Affichage des permissions pour le rôle sélectionné */}
          {selectedRole ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getRoleColor(selectedRole.name)}>
                    {selectedRole.name}
                  </Badge>
                  {isAdminRole && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Permissions système (lecture seule)
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {menusStructure.reduce((total, menu) => 
                    total + menu.sous_menus.reduce((subTotal, sousMenu) => 
                      subTotal + sousMenu.permissions.length, 0
                    ), 0
                  )} permissions au total
                </div>
              </div>

              {menusStructure.map((menu) => (
                <div key={menu.menu_id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <h4 className="font-semibold text-lg">{menu.menu_nom}</h4>
                    <Badge variant="outline" className="ml-auto">
                      {menu.sous_menus.reduce((total, sm) => total + sm.permissions.length, 0)} permission(s)
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {menu.sous_menus.map((sousMenu) => (
                      <div key={`${menu.menu_id}-${sousMenu.sous_menu_id || 'main'}`} className="ml-4">
                        <div className="font-medium mb-3 text-muted-foreground flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {sousMenu.sous_menu_nom || 'Menu principal'}
                          {sousMenu.sous_menu_description && (
                            <span className="text-xs">- {sousMenu.sous_menu_description}</span>
                          )}
                          <Badge variant="outline" className="ml-auto text-xs">
                            {sousMenu.permissions.length} action(s)
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 ml-4">
                          {sousMenu.permissions.map((permission) => {
                            const hasAccess = hasPermission(
                              selectedRole.id,
                              menu.menu_nom,
                              sousMenu.sous_menu_nom || null,
                              permission.action
                            );

                            return (
                              <div
                                key={permission.permission_id}
                                className={`flex items-center space-x-3 p-3 border rounded-lg transition-all hover:shadow-sm ${
                                  hasAccess ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'
                                }`}
                              >
                                <Checkbox
                                  checked={hasAccess}
                                  onCheckedChange={() =>
                                    togglePermission(selectedRole.id, permission.permission_id, hasAccess)
                                  }
                                  disabled={isAdminRole || updateRolePermission.isPending}
                                />
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Badge 
                                      variant="outline" 
                                      className={`${getActionColor(permission.action)} text-xs font-medium`}
                                    >
                                      <div className="flex items-center space-x-1">
                                        {getActionIcon(permission.action)}
                                        <span className="uppercase font-bold">{permission.action}</span>
                                      </div>
                                    </Badge>
                                  </div>
                                  
                                  <div className="text-sm font-medium text-gray-700">
                                    {getActionLabel(permission.action)}
                                  </div>
                                  
                                  {permission.permission_description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {permission.permission_description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {menusStructure.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune permission trouvée</p>
                  <p className="text-xs mt-1">La structure des permissions n'a pas pu être chargée</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Sélectionnez un rôle
              </h3>
              <p className="text-sm text-muted-foreground">
                Choisissez un rôle ci-dessus pour modifier ses permissions
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Structure complète disponible :</p>
                <p>• Dashboard, Catalogue, Stock, Achats, Ventes, Clients, Caisse, Rapports, Paramètres</p>
                <p>• Actions : Lecture, Écriture, Suppression, Validation, Export, Import, etc.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
