
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useRolePermissions, usePermissions, useUpdateRolePermissions } from '@/hooks/usePermissions';
import { Settings, Eye, Edit, Trash2, Save } from 'lucide-react';

// STRUCTURE SYNCHRONISÉE AVEC PermissionsMatrix et PermissionsManagement
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

interface RolePermissionsDialogProps {
  role: {
    id: string;
    name: string;
    description?: string;
    is_system?: boolean;
  };
  children: React.ReactNode;
}

const RolePermissionsDialog = ({ role, children }: RolePermissionsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading, refetch: refetchRolePermissions } = useRolePermissions(role.id);
  const updateRolePermissions = useUpdateRolePermissions();

  const hasPermission = (menu: string, submenu: string | null, action: string) => {
    const key = `${menu}-${submenu || 'null'}-${action}`;
    if (key in pendingChanges) {
      return pendingChanges[key];
    }
    
    // Corriger l'accès à la permission via l'ID
    return rolePermissions.some(rp => {
      const permission = permissions.find(p => p.id === rp.permission_id);
      return permission && 
             permission.menu === menu &&
             permission.submenu === submenu &&
             permission.action === action &&
             rp.can_access;
    });
  };

  const handlePermissionToggle = (menu: string, submenu: string | null, action: string, enabled: boolean) => {
    const key = `${menu}-${submenu || 'null'}-${action}`;
    setPendingChanges(prev => ({
      ...prev,
      [key]: enabled
    }));
  };

  const handleSave = async () => {
    try {
      console.log('🔄 Saving role permissions for role:', role.id);
      console.log('📋 Pending changes:', pendingChanges);

      // Traiter chaque changement en attente individuellement
      for (const [key, canAccess] of Object.entries(pendingChanges)) {
        const [menu, submenu, action] = key.split('-');
        const actualSubmenu = submenu === 'null' ? null : submenu;
        
        const permission = permissions.find(p => 
          p.menu === menu && 
          p.submenu === actualSubmenu && 
          p.action === action
        );
        
        if (permission) {
          await updateRolePermissions.mutateAsync({
            roleId: role.id,
            permissionId: permission.id,
            canAccess
          });
        }
      }

      setPendingChanges({});
      await refetchRolePermissions();
      setIsOpen(false);
    } catch (error) {
      console.error('❌ Error updating permissions:', error);
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
        return <Settings className="h-3 w-3" />;
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
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isLoading = permissionsLoading || rolePermissionsLoading;
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Permissions du rôle "{role.name}"</span>
            </DialogTitle>
            {hasPendingChanges && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Modifications en attente
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {role.description && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          )}

          {role.is_system && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                ⚠️ Ce rôle système ne peut pas être supprimé, mais ses permissions peuvent être modifiées.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Chargement des permissions...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grouper par menu */}
              {APPLICATION_MENUS.reduce((acc, menuItem) => {
                const menuKey = menuItem.menu;
                if (!acc.find(group => group.menu === menuKey)) {
                  acc.push({
                    menu: menuKey,
                    items: APPLICATION_MENUS.filter(item => item.menu === menuKey)
                  });
                }
                return acc;
              }, [] as { menu: string; items: typeof APPLICATION_MENUS }[]).map(({ menu, items }) => (
                <div key={menu} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-lg">{menu}</h4>
                    <Badge variant="outline">
                      {items.length} permission(s)
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((menuItem, index) => (
                      menuItem.actions.map(action => (
                        <div key={`${menuItem.menu}-${menuItem.submenu}-${action}-${index}`} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                          <Checkbox
                            id={`${menuItem.menu}-${menuItem.submenu || 'null'}-${action}`}
                            checked={hasPermission(menuItem.menu, menuItem.submenu, action)}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(menuItem.menu, menuItem.submenu, action, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`${getActionColor(action)} text-xs`}
                              >
                                <div className="flex items-center space-x-1">
                                  {getActionIcon(action)}
                                  <span className="capitalize">{action}</span>
                                </div>
                              </Badge>
                              {menuItem.submenu && (
                                <span className="text-sm font-medium">
                                  {menuItem.submenu}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {menuItem.description}
                            </p>
                          </div>
                        </div>
                      ))
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateRolePermissions.isPending}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>
              {updateRolePermissions.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RolePermissionsDialog;
