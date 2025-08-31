
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, User, CheckCircle, XCircle } from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useAuth } from '@/components/auth/AuthContext';

export const UserPermissionsDisplay = () => {
  const { permissions, isLoading } = useUserPermissions();
  const { utilisateurInterne } = useAuth();

  // Structure complète des menus de l'application
  const APPLICATION_STRUCTURE = [
    {
      menu: 'Dashboard',
      submenus: [],
      actions: ['read']
    },
    {
      menu: 'Catalogue',
      submenus: [],
      actions: ['read', 'write', 'delete']
    },
    {
      menu: 'Stock',
      submenus: ['Entrepôts', 'PDV', 'Mouvements', 'Inventaire'],
      actions: ['read', 'write', 'delete']
    },
    {
      menu: 'Ventes',
      submenus: ['Factures', 'Précommandes', 'Devis'],
      actions: ['read', 'write', 'delete']
    },
    {
      menu: 'Achats',
      submenus: ['Bons de commande', 'Bons de livraison', 'Factures fournisseurs'],
      actions: ['read', 'write', 'delete']
    },
    {
      menu: 'Clients',
      submenus: [],
      actions: ['read', 'write', 'delete']
    },
    {
      menu: 'Caisse',
      submenus: ['Clôtures', 'Comptages'],
      actions: ['read', 'write']
    },
    {
      menu: 'Rapports',
      submenus: ['Ventes', 'Achats', 'Stock', 'Clients', 'Marges', 'Financiers', 'Caisse'],
      actions: ['read']
    },
    {
      menu: 'Marges',
      submenus: ['Articles', 'Catégories', 'Globales', 'Factures', 'Périodes'],
      actions: ['read']
    },
    {
      menu: 'Paramètres',
      submenus: ['Zone Géographique', 'Fournisseurs', 'Entrepôts', 'Points de vente', 'Utilisateurs', 'Permissions'],
      actions: ['read', 'write']
    }
  ];

  const hasPermission = (menu: string, submenu: string | null, action: string) => {
    return permissions.some(permission => 
      permission.menu === menu &&
      (submenu === null ? permission.submenu === undefined || permission.submenu === null : permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access
    );
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
        return <Eye className="h-3 w-3" />;
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
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Mes Permissions
          </CardTitle>
          {utilisateurInterne?.role && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                Rôle : {utilisateurInterne.role.name || utilisateurInterne.role.nom}
              </Badge>
              <Badge variant="secondary">
                {permissions.length} permissions actives
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {APPLICATION_STRUCTURE.map((menuStructure) => (
              <div key={menuStructure.menu} className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    📁 {menuStructure.menu}
                  </h3>
                </div>

                {/* Permissions principales du menu (sans sous-menu) */}
                {menuStructure.submenus.length === 0 && (
                  <div className="ml-4 space-y-3">
                    <h4 className="font-medium text-muted-foreground">Actions principales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {menuStructure.actions.map((action) => {
                        const hasAccess = hasPermission(menuStructure.menu, null, action);
                        return (
                          <div 
                            key={`${menuStructure.menu}-main-${action}`}
                            className={`flex items-center justify-between p-3 border rounded-lg ${
                              hasAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`${getActionColor(action)} text-xs`}
                              >
                                <div className="flex items-center gap-1">
                                  {getActionIcon(action)}
                                  <span>{getActionLabel(action)}</span>
                                </div>
                              </Badge>
                            </div>
                            {hasAccess ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Permissions pour chaque sous-menu */}
                {menuStructure.submenus.length > 0 && (
                  <div className="ml-4 space-y-4">
                    {menuStructure.submenus.map((submenu) => (
                      <div key={`${menuStructure.menu}-${submenu}`} className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          📂 {submenu}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-4">
                          {menuStructure.actions.map((action) => {
                            const hasAccess = hasPermission(menuStructure.menu, submenu, action);
                            return (
                              <div 
                                key={`${menuStructure.menu}-${submenu}-${action}`}
                                className={`flex items-center justify-between p-2 border rounded ${
                                  hasAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`${getActionColor(action)} text-xs`}
                                  >
                                    <div className="flex items-center gap-1">
                                      {getActionIcon(action)}
                                      <span className="text-xs">{getActionLabel(action)}</span>
                                    </div>
                                  </Badge>
                                </div>
                                {hasAccess ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-600" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
