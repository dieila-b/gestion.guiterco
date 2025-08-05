
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Users } from 'lucide-react';
import { useRoles, usePermissions, useRolePermissions, useUpdateRolePermission } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

interface PermissionGroup {
  name: string;
  permissions: {
    id: string;
    label: string;
    action: string;
    menu: string;
    submenu?: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'Achats',
    permissions: [
      { id: 'achats-read', label: 'Consulter les bons de commande', action: 'read', menu: 'Achats', submenu: 'Bons de commande' },
      { id: 'achats-write', label: 'Créer/modifier les bons de commande', action: 'write', menu: 'Achats', submenu: 'Bons de commande' },
      { id: 'achats-invoice-read', label: 'Consulter les bons de livraison', action: 'read', menu: 'Achats', submenu: 'Bons de livraison' },
      { id: 'achats-supplier-read', label: 'Gérer les bons de livraison', action: 'write', menu: 'Achats', submenu: 'Bons de livraison' },
      { id: 'achats-supplier-write', label: 'Consulter les factures d\'achat', action: 'read', menu: 'Achats', submenu: 'Factures' },
      { id: 'achats-facture-write', label: 'Gérer les factures d\'achat', action: 'write', menu: 'Achats', submenu: 'Factures' },
      { id: 'achats-fournisseurs-read', label: 'Consulter les fournisseurs', action: 'read', menu: 'Paramètres', submenu: 'Fournisseurs' },
      { id: 'achats-fournisseurs-write', label: 'Gérer les fournisseurs', action: 'write', menu: 'Paramètres', submenu: 'Fournisseurs' }
    ]
  },
  {
    name: 'Caisse',
    permissions: [
      { id: 'caisse-read', label: 'Consulter les caisses', action: 'read', menu: 'Caisse' },
      { id: 'caisse-operation-read', label: 'Effectuer les opérations', action: 'read', menu: 'Caisse', submenu: 'Opérations' },
      { id: 'caisse-operation-write', label: 'Consulter l\'état de caisse', action: 'write', menu: 'Caisse', submenu: 'États' },
      { id: 'caisse-comptage-read', label: 'Consulter les comptages de caisse', action: 'read', menu: 'Caisse', submenu: 'Comptages' },
      { id: 'caisse-comptage-write', label: 'Effectuer des comptages de caisse', action: 'write', menu: 'Caisse', submenu: 'Comptages' }
    ]
  },
  {
    name: 'Catalogue',
    permissions: [
      { id: 'catalogue-read', label: 'Voir les catégories', action: 'read', menu: 'Catalogue' },
      { id: 'catalogue-write', label: 'Gérer les catégories', action: 'write', menu: 'Catalogue' },
      { id: 'catalogue-articles-read', label: 'Supprimer des articles', action: 'delete', menu: 'Catalogue', submenu: 'Articles' },
      { id: 'catalogue-articles-write', label: 'Consulter le catalogue', action: 'read', menu: 'Catalogue', submenu: 'Articles' },
      { id: 'catalogue-articles-delete', label: 'Modifier le catalogue', action: 'write', menu: 'Catalogue', submenu: 'Articles' }
    ]
  },
  {
    name: 'Clients',
    permissions: [
      { id: 'clients-read', label: 'Supprimer des clients', action: 'delete', menu: 'Clients' },
      { id: 'clients-write', label: 'Consulter les clients', action: 'read', menu: 'Clients' },
      { id: 'clients-delete', label: 'Gérer les clients', action: 'write', menu: 'Clients' }
    ]
  },
  {
    name: 'Dashboard',
    permissions: [
      { id: 'dashboard-read', label: 'Voir le tableau de bord', action: 'read', menu: 'Dashboard' }
    ]
  },
  {
    name: 'Finance',
    permissions: [
      { id: 'finance-depenses-read', label: 'Consulter les dépenses', action: 'read', menu: 'Finance', submenu: 'Dépenses' },
      { id: 'finance-depenses-write', label: 'Gérer les dépenses', action: 'write', menu: 'Finance', submenu: 'Dépenses' },
      { id: 'finance-rapports-read', label: 'Consulter les rapports financiers', action: 'read', menu: 'Finance', submenu: 'Rapports' },
      { id: 'finance-recettes-read', label: 'Consulter les recettes', action: 'read', menu: 'Finance', submenu: 'Recettes' },
      { id: 'finance-tresorerie-read', label: 'Consulter la trésorerie', action: 'read', menu: 'Finance', submenu: 'Trésorerie' }
    ]
  },
  {
    name: 'Paramètres',
    permissions: [
      { id: 'parametres-geo-read', label: 'Consulter les paramètres généraux', action: 'read', menu: 'Paramètres', submenu: 'Zone Géographique' },
      { id: 'parametres-geo-write', label: 'Modifier les paramètres généraux', action: 'write', menu: 'Paramètres', submenu: 'Zone Géographique' },
      { id: 'parametres-profile-read', label: 'Voir le profil', action: 'read', menu: 'Paramètres', submenu: 'Profil' },
      { id: 'parametres-profile-write', label: 'Modifier le profil', action: 'write', menu: 'Paramètres', submenu: 'Profil' },
      { id: 'parametres-permissions-read', label: 'Consulter les rôles et permissions', action: 'read', menu: 'Paramètres', submenu: 'Permissions' },
      { id: 'parametres-permissions-write', label: 'Gérer les rôles et permissions', action: 'write', menu: 'Paramètres', submenu: 'Permissions' },
      { id: 'parametres-utilisateurs-read', label: 'Consulter les utilisateurs', action: 'read', menu: 'Paramètres', submenu: 'Utilisateurs' },
      { id: 'parametres-utilisateurs-write', label: 'Gérer les utilisateurs', action: 'write', menu: 'Paramètres', submenu: 'Utilisateurs' }
    ]
  },
  {
    name: 'Rapports',
    permissions: [
      { id: 'rapports-ventes-read', label: 'Rapports ventes', action: 'read', menu: 'Rapports', submenu: 'Ventes' },
      { id: 'rapports-marges-read', label: 'Rapports de marges', action: 'read', menu: 'Rapports', submenu: 'Marges' },
      { id: 'rapports-stock-read', label: 'Rapports de stock', action: 'read', menu: 'Rapports', submenu: 'Stock' },
      { id: 'rapports-ventes-export', label: 'Rapports de ventes', action: 'export', menu: 'Rapports', submenu: 'Ventes' }
    ]
  },
  {
    name: 'Stock',
    permissions: [
      { id: 'stock-entrepots-read', label: 'Consulter les stocks entrepôts', action: 'read', menu: 'Stock', submenu: 'Entrepôts' }
    ]
  },
  {
    name: 'Ventes',
    permissions: [
      { id: 'ventes-devis-read', label: 'Consulter les devis', action: 'read', menu: 'Ventes', submenu: 'Devis' }
    ]
  }
];

export default function PermissionsMatrixTable() {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading } = useRolePermissions();
  const updateRolePermission = useUpdateRolePermission();

  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  // Filtrer les rôles principaux
  const mainRoles = roles.filter(role => 
    ['Administrateur', 'Caissier', 'Manager', 'Vendeur'].includes(role.name)
  );

  const getPermissionByMenuAction = (menu: string, submenu: string | undefined, action: string) => {
    return permissions.find(p => 
      p.menu === menu && 
      p.submenu === submenu && 
      p.action === action
    );
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    const key = `${roleId}-${permissionId}`;
    if (key in pendingChanges) {
      return pendingChanges[key];
    }
    
    const rolePermission = rolePermissions.find(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    );
    return rolePermission?.can_access || false;
  };

  const handlePermissionChange = async (roleId: string, permissionId: string, canAccess: boolean) => {
    const key = `${roleId}-${permissionId}`;
    setPendingChanges(prev => ({ ...prev, [key]: canAccess }));
    
    try {
      await updateRolePermission.mutateAsync({
        roleId,
        permissionId,
        canAccess
      });
      
      // Retirer du pending après succès
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });
      
      toast.success('Permission mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
      
      // Retirer du pending en cas d'erreur
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read': return 'bg-green-100 text-green-800 border-green-200';
      case 'write': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete': return 'bg-red-100 text-red-800 border-red-200';
      case 'export': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'read': return 'read';
      case 'write': return 'write';
      case 'delete': return 'delete';
      case 'export': return 'export';
      default: return action;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Édition des Permissions par Rôle
          <span className="text-sm text-muted-foreground font-normal ml-2">
            Configurez les permissions par rôle et par menu
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* En-têtes des rôles */}
        <div className="mb-6 flex gap-4 justify-end">
          {mainRoles.map((role) => (
            <div key={role.id} className="text-center w-24">
              <div className="font-medium text-sm">{role.name}</div>
            </div>
          ))}
        </div>

        {/* Groupes de permissions */}
        <div className="space-y-8">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.name} className="space-y-2">
              {/* En-tête du groupe */}
              <div className="font-semibold text-lg text-primary mb-4">
                {group.name}
              </div>

              {/* Permissions du groupe */}
              <div className="space-y-1">
                {group.permissions.map((permission) => {
                  const dbPermission = getPermissionByMenuAction(
                    permission.menu,
                    permission.submenu,
                    permission.action
                  );

                  if (!dbPermission) return null;

                  return (
                    <div key={permission.id} className="flex items-center justify-between py-2 px-2 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-1 ${getActionColor(permission.action)}`}
                        >
                          {getActionLabel(permission.action)}
                        </Badge>
                        <span className="text-sm">{permission.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {mainRoles.map((role) => (
                          <div key={role.id} className="w-24 flex justify-center">
                            <Switch
                              checked={hasPermission(role.id, dbPermission.id)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(role.id, dbPermission.id, checked)
                              }
                              disabled={updateRolePermission.isPending}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
