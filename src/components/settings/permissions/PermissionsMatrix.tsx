
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Settings, Eye, Edit, Trash2, Save } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePermissions, useRoles, useRolePermissions, useUpdateRolePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

// Structure complète des menus de l'application - SYNCHRONISÉE
const APPLICATION_MENUS = [
  {
    menu: 'Dashboard',
    submenu: null,
    actions: ['read'],
    description: 'Tableau de bord principal'
  },
  {
    menu: 'Catalogue',
    submenu: null,
    actions: ['read', 'write', 'delete'],
    description: 'Gestion du catalogue produits'
  },
  {
    menu: 'Stock',
    submenu: 'Entrepôts',
    actions: ['read', 'write'],
    description: 'Gestion des stocks entrepôts'
  },
  {
    menu: 'Stock',
    submenu: 'PDV',
    actions: ['read', 'write'],
    description: 'Gestion des stocks points de vente'
  },
  {
    menu: 'Stock',
    submenu: 'Transferts',
    actions: ['read', 'write'],
    description: 'Gestion des transferts de stock'
  },
  {
    menu: 'Stock',
    submenu: 'Entrées',
    actions: ['read', 'write'],
    description: 'Gestion des entrées de stock'
  },
  {
    menu: 'Stock',
    submenu: 'Sorties',
    actions: ['read', 'write'],
    description: 'Gestion des sorties de stock'
  },
  {
    menu: 'Achats',
    submenu: 'Bons de commande',
    actions: ['read', 'write'],
    description: 'Gestion des bons de commande'
  },
  {
    menu: 'Achats',
    submenu: 'Bons de livraison',
    actions: ['read', 'write'],
    description: 'Gestion des bons de livraison'
  },
  {
    menu: 'Achats',
    submenu: 'Factures',
    actions: ['read', 'write'],
    description: 'Gestion des factures d\'achat'
  },
  {
    menu: 'Ventes',
    submenu: 'Factures',
    actions: ['read', 'write'],
    description: 'Gestion des factures de vente'
  },
  {
    menu: 'Ventes',
    submenu: 'Précommandes',
    actions: ['read', 'write'],
    description: 'Gestion des précommandes'
  },
  {
    menu: 'Ventes',
    submenu: 'Devis',
    actions: ['read', 'write'],
    description: 'Gestion des devis'
  },
  {
    menu: 'Ventes',
    submenu: 'Vente au Comptoir',
    actions: ['read', 'write'],
    description: 'Gestion des ventes au comptoir'
  },
  {
    menu: 'Ventes',
    submenu: 'Factures impayées',
    actions: ['read', 'write'],
    description: 'Gestion des factures impayées'
  },
  {
    menu: 'Ventes',
    submenu: 'Retours Clients',
    actions: ['read', 'write'],
    description: 'Gestion des retours clients'
  },
  {
    menu: 'Clients',
    submenu: null,
    actions: ['read', 'write'],
    description: 'Gestion des clients'
  },
  {
    menu: 'Clients',
    submenu: 'Clients',
    actions: ['read', 'write'],
    description: 'Gestion détaillée des clients'
  },
  {
    menu: 'Caisse',
    submenu: null,
    actions: ['read', 'write'],
    description: 'Gestion de la caisse'
  },
  {
    menu: 'Caisse',
    submenu: 'Dépenses',
    actions: ['read', 'write'],
    description: 'Gestion des dépenses de caisse'
  },
  {
    menu: 'Caisse',
    submenu: 'Aperçu du jour',
    actions: ['read'],
    description: 'Consultation de l\'aperçu journalier'
  },
  {
    menu: 'Marges',
    submenu: null,
    actions: ['read'],
    description: 'Consultation des marges'
  },
  {
    menu: 'Rapports',
    submenu: null,
    actions: ['read', 'write'],
    description: 'Génération de rapports'
  },
  {
    menu: 'Paramètres',
    submenu: null,
    actions: ['read', 'write'],
    description: 'Accès aux paramètres généraux'
  },
  {
    menu: 'Paramètres',
    submenu: 'Utilisateurs',
    actions: ['read', 'write'],
    description: 'Gestion des utilisateurs'
  },
  {
    menu: 'Paramètres',
    submenu: 'Permissions',
    actions: ['read', 'write'],
    description: 'Gestion des permissions'
  },
  {
    menu: 'Paramètres',
    submenu: 'Fournisseurs',
    actions: ['read', 'write'],
    description: 'Gestion des fournisseurs'
  }
];

const PermissionsMatrix = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Fetch data
  const { data: permissions = [], isLoading: permissionsLoading, error: permissionsError } = usePermissions();
  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useRoles();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading, refetch: refetchRolePermissions } = useRolePermissions(selectedRole || undefined);
  const updateRolePermissions = useUpdateRolePermissions();

  const hasPermission = (menu: string, submenu: string | null, action: string) => {
    if (!selectedRole) return false;
    
    const key = getPermissionKey(menu, submenu, action);
    if (key in pendingChanges) {
      return pendingChanges[key];
    }
    
    return rolePermissions?.some(rp => {
      const permission = rp.permission;
      return permission && 
             permission.menu === menu &&
             permission.submenu === submenu &&
             permission.action === action &&
             rp.can_access;
    }) || false;
  };

  const getPermissionKey = (menu: string, submenu: string | null, action: string) => {
    return `${menu}-${submenu || 'null'}-${action}`;
  };

  const handlePermissionToggle = (menu: string, submenu: string | null, action: string, enabled: boolean) => {
    const key = getPermissionKey(menu, submenu, action);
    setPendingChanges(prev => ({
      ...prev,
      [key]: enabled
    }));
  };

  const applyChanges = async () => {
    if (!selectedRole) return;

    try {
      console.log('🔄 Applying permission changes for role:', selectedRole);
      console.log('📋 Pending changes:', pendingChanges);

      // Construire la liste complète des permissions basée sur APPLICATION_MENUS
      const permissionUpdates: { permission_id: string; can_access: boolean }[] = [];
      
      APPLICATION_MENUS.forEach(menuItem => {
        menuItem.actions.forEach(action => {
          const permission = permissions.find(p => 
            p.menu === menuItem.menu && 
            p.submenu === menuItem.submenu && 
            p.action === action
          );
          
          if (permission) {
            const key = getPermissionKey(menuItem.menu, menuItem.submenu, action);
            const isEnabled = pendingChanges.hasOwnProperty(key) 
              ? pendingChanges[key] 
              : hasPermission(menuItem.menu, menuItem.submenu, action);
            
            permissionUpdates.push({
              permission_id: permission.id,
              can_access: isEnabled
            });
          }
        });
      });

      console.log('📤 Sending permission updates:', permissionUpdates);

      await updateRolePermissions.mutateAsync({
        roleId: selectedRole,
        permissionUpdates: permissionUpdates
      });

      setPendingChanges({});
      await refetchRolePermissions();
      
      toast({
        title: "Permissions mises à jour",
        description: "Les changements ont été appliqués avec succès.",
      });

    } catch (error) {
      console.error('❌ Error updating permissions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les permissions.",
        variant: "destructive",
      });
    }
  };

  const isLoading = permissionsLoading || rolesLoading;
  const error = permissionsError || rolesError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement de la matrice...</p>
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
            Impossible de charger les données : {error.message}
          </p>
        </div>
      </div>
    );
  }

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Matrice des Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les permissions détaillées par rôle et fonctionnalité
          </p>
        </div>
        
        {hasPendingChanges && (
          <Button onClick={applyChanges} disabled={updateRolePermissions.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateRolePermissions.isPending ? 'Sauvegarde...' : 'Sauvegarder les changements'}
          </Button>
        )}
      </div>

      {/* Sélecteur de rôle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Sélection du Rôle</span>
          </CardTitle>
          <CardDescription>
            Choisissez le rôle pour lequel vous souhaitez configurer les permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Button
                key={role.id}
                variant={selectedRole === role.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedRole(selectedRole === role.id ? null : role.id);
                  setPendingChanges({});
                }}
                className="capitalize"
              >
                {role.name}
                {selectedRole === role.id && (
                  <span className="ml-2 text-xs bg-primary-foreground text-primary rounded-full px-2 py-1">
                    Sélectionné
                  </span>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matrice des permissions */}
      {selectedRole ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Matrice de Permissions - {roles.find(r => r.id === selectedRole)?.name}</span>
              {hasPendingChanges && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {Object.keys(pendingChanges).length} changement(s) en attente
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Gérez les permissions par menu et action pour ce rôle
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rolePermissionsLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Chargement des permissions...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Menu / Fonctionnalité</TableHead>
                      <TableHead className="text-center w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <Eye className="h-4 w-4 text-green-600" />
                          <span>Lecture</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <Edit className="h-4 w-4 text-blue-600" />
                          <span>Écriture</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span>Suppression</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {APPLICATION_MENUS.map((menuItem, index) => {
                      const menuLabel = menuItem.submenu 
                        ? `${menuItem.menu} → ${menuItem.submenu}`
                        : menuItem.menu;

                      return (
                        <TableRow key={index} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{menuLabel}</div>
                              <div className="text-sm text-muted-foreground">
                                {menuItem.description}
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* Lecture */}
                          <TableCell className="text-center">
                            {menuItem.actions.includes('read') && (
                              <Checkbox
                                checked={hasPermission(menuItem.menu, menuItem.submenu, 'read')}
                                onCheckedChange={(checked) =>
                                  handlePermissionToggle(menuItem.menu, menuItem.submenu, 'read', !!checked)
                                }
                              />
                            )}
                          </TableCell>
                          
                          {/* Écriture */}
                          <TableCell className="text-center">
                            {menuItem.actions.includes('write') && (
                              <Checkbox
                                checked={hasPermission(menuItem.menu, menuItem.submenu, 'write')}
                                onCheckedChange={(checked) =>
                                  handlePermissionToggle(menuItem.menu, menuItem.submenu, 'write', !!checked)
                                }
                              />
                            )}
                          </TableCell>
                          
                          {/* Suppression */}
                          <TableCell className="text-center">
                            {menuItem.actions.includes('delete') && (
                              <Checkbox
                                checked={hasPermission(menuItem.menu, menuItem.submenu, 'delete')}
                                onCheckedChange={(checked) =>
                                  handlePermissionToggle(menuItem.menu, menuItem.submenu, 'delete', !!checked)
                                }
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sélectionnez un rôle</h3>
            <p className="text-muted-foreground">
              Choisissez un rôle ci-dessus pour configurer ses permissions dans la matrice
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PermissionsMatrix;
