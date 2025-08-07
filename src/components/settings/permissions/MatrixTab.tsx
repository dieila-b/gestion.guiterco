
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  useRoles, 
  useAllRolePermissions, 
  useUpdateRolePermission,
  Role
} from '@/hooks/usePermissionsSystem';
import { useGroupedMenusStructure } from '@/hooks/useMenusStructure';
import { Settings, Eye, Edit, Trash2, Shield, Check, X, FileText, Download, Upload, AlertCircle, Lock, Calculator, TrendingUp, Users, Package, Warehouse, ShoppingCart, BarChart3 } from 'lucide-react';

export default function MatrixTab() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: rolePermissions = [], isLoading: rpLoading } = useAllRolePermissions();
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
      case 'read': return <Eye className="h-3 w-3" />;
      case 'write': return <Edit className="h-3 w-3" />;
      case 'delete': return <Trash2 className="h-3 w-3" />;
      case 'validate': return <Check className="h-3 w-3" />;
      case 'cancel': return <X className="h-3 w-3" />;
      case 'convert': return <FileText className="h-3 w-3" />;
      case 'export': return <Download className="h-3 w-3" />;
      case 'import': return <Upload className="h-3 w-3" />;
      case 'print': return <FileText className="h-3 w-3" />;
      case 'close': return <Lock className="h-3 w-3" />;
      case 'reopen': return <AlertCircle className="h-3 w-3" />;
      case 'transfer': return <TrendingUp className="h-3 w-3" />;
      case 'receive': return <Package className="h-3 w-3" />;
      case 'deliver': return <TrendingUp className="h-3 w-3" />;
      case 'invoice': return <FileText className="h-3 w-3" />;
      case 'payment': return <Calculator className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'read': return 'Consulter';
      case 'write': return 'Gérer';
      case 'delete': return 'Supprimer';
      case 'validate': return 'Valider';
      case 'cancel': return 'Annuler';
      case 'convert': return 'Convertir';
      case 'export': return 'Exporter';
      case 'import': return 'Importer';
      case 'print': return 'Imprimer';
      case 'close': return 'Clôturer';
      case 'reopen': return 'Rouvrir';
      case 'transfer': return 'Transférer';
      case 'receive': return 'Réceptionner';
      case 'deliver': return 'Livrer';
      case 'invoice': return 'Facturer';
      case 'payment': return 'Paiements';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read': return 'text-green-600 bg-green-50 border-green-200';
      case 'write': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delete': return 'text-red-600 bg-red-50 border-red-200';
      case 'validate': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'cancel': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'convert': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'export': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'import': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      case 'print': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'close': return 'text-red-700 bg-red-100 border-red-300';
      case 'reopen': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'transfer': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'receive': return 'text-lime-600 bg-lime-50 border-lime-200';
      case 'deliver': return 'text-sky-600 bg-sky-50 border-sky-200';
      case 'invoice': return 'text-violet-600 bg-violet-50 border-violet-200';
      case 'payment': return 'text-pink-600 bg-pink-50 border-pink-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrateur': return 'bg-red-500 text-white hover:bg-red-600';
      case 'manager': return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'vendeur': return 'bg-green-500 text-white hover:bg-green-600';
      case 'caissier': return 'bg-purple-500 text-white hover:bg-purple-600';
      default: return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const getMenuIcon = (menuName: string) => {
    switch (menuName.toLowerCase()) {
      case 'dashboard': return <BarChart3 className="w-4 h-4" />;
      case 'catalogue': return <Package className="w-4 h-4" />;
      case 'stock': return <Warehouse className="w-4 h-4" />;
      case 'achats': return <ShoppingCart className="w-4 h-4" />;
      case 'ventes': return <TrendingUp className="w-4 h-4" />;
      case 'clients': return <Users className="w-4 h-4" />;
      case 'caisse': return <Calculator className="w-4 h-4" />;
      case 'rapports': return <FileText className="w-4 h-4" />;
      case 'paramètres': return <Settings className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const isAdminRole = selectedRole?.name === 'Administrateur' && selectedRole?.is_system;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement de la matrice complète...</span>
      </div>
    );
  }

  const totalPermissions = menusStructure.reduce((total, menu) => 
    total + menu.sous_menus.reduce((subTotal, sousMenu) => 
      subTotal + sousMenu.permissions.length, 0
    ), 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Matrice Complète des Permissions
        </h3>
        <p className="text-sm text-muted-foreground">
          Système exhaustif de gestion des permissions - {totalPermissions} permissions disponibles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Configuration Avancée des Permissions</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{roles.length} rôles</Badge>
              <Badge variant="outline">{menusStructure.length} menus</Badge>
              <Badge variant="outline">{totalPermissions} permissions</Badge>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gestion granulaire des droits d'accès par rôle avec toutes les actions métier
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection des rôles */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Sélectionnez un rôle à configurer :
            </h4>
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

          {/* Configuration des permissions pour le rôle sélectionné */}
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
                      Rôle système (lecture seule)
                    </Badge>
                  )}
                  {selectedRole.description && (
                    <span className="text-sm text-muted-foreground">
                      {selectedRole.description}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalPermissions} permissions configurables
                </div>
              </div>

              {menusStructure.map((menu) => (
                <div key={menu.menu_id} className="border rounded-lg p-6 bg-card">
                  <div className="flex items-center gap-3 mb-6">
                    {getMenuIcon(menu.menu_nom)}
                    <h4 className="font-semibold text-lg">{menu.menu_nom}</h4>
                    {menu.description && (
                      <span className="text-sm text-muted-foreground">
                        - {menu.description}
                      </span>
                    )}
                    <Badge variant="outline" className="ml-auto">
                      {menu.sous_menus.reduce((total, sm) => total + sm.permissions.length, 0)} permission(s)
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {menu.sous_menus.map((sousMenu) => (
                      <div key={`${menu.menu_id}-${sousMenu.sous_menu_id || 'main'}`} className="ml-6">
                        <div className="font-medium mb-4 text-muted-foreground flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {sousMenu.sous_menu_nom || 'Accès direct au menu'}
                          {sousMenu.sous_menu_description && (
                            <span className="text-xs font-normal">- {sousMenu.sous_menu_description}</span>
                          )}
                          <Badge variant="outline" className="ml-auto text-xs">
                            {sousMenu.permissions.length} action(s)
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 ml-6">
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
                                className={`flex items-center space-x-3 p-4 border rounded-lg transition-all hover:shadow-md ${
                                  hasAccess ? 'bg-green-50 border-green-200 shadow-sm' : 'hover:bg-muted/50'
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
                                  <div className="flex items-center space-x-2 mb-2">
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
                                  
                                  <div className="text-sm font-medium text-gray-700 mb-1">
                                    {getActionLabel(permission.action)}
                                  </div>
                                  
                                  {permission.permission_description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
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
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Structure non disponible</h3>
                  <p className="text-sm">La structure complète des permissions n'a pas pu être chargée</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <Settings className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-medium text-muted-foreground mb-4">
                Sélectionnez un rôle pour commencer
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Choisissez un rôle ci-dessus pour configurer ses permissions de manière exhaustive
              </p>
              <div className="bg-muted/30 rounded-lg p-6 max-w-2xl mx-auto">
                <h4 className="font-medium mb-3">🎯 Fonctionnalités disponibles :</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p>• Dashboard avec indicateurs</p>
                  <p>• Catalogue complet</p>
                  <p>• Gestion de stock avancée</p>
                  <p>• Achats et approvisionnements</p>
                  <p>• Ventes et facturation</p>
                  <p>• Relation client (CRM)</p>
                  <p>• Caisse et paiements</p>
                  <p>• Rapports et analyses</p>
                </div>
                <p className="text-xs mt-4 font-medium">
                  Chaque module dispose d'actions granulaires : lecture, écriture, suppression, validation, etc.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
