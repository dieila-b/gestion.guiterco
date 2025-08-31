
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle, XCircle } from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useAuth } from '@/components/auth/AuthContext';
import { APPLICATION_STRUCTURE, getActionIcon, getActionLabel, getActionColor } from './ApplicationStructure';

export const UserPermissionsDisplay = () => {
  const { data: permissions = [], isLoading } = useUserPermissions();
  const { utilisateurInterne } = useAuth();

  const hasPermission = (menu: string, submenu: string | null, action: string) => {
    return permissions.some(permission => 
      permission.menu === menu &&
      (submenu === null ? permission.submenu === undefined || permission.submenu === null : permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access
    );
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
                    {menuStructure.icon} {menuStructure.menu}
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
                          {menuStructure.actions
                            .filter(action => {
                              // Pour certains sous-menus, filtrer les actions selon leur logique métier
                              if (submenu === 'Inventaire' || submenu === 'Mouvements') {
                                return ['read', 'write'].includes(action);
                              }
                              if (menuStructure.menu === 'Rapports' || menuStructure.menu === 'Marges') {
                                return action === 'read';
                              }
                              if (menuStructure.menu === 'Caisse' && ['Clôtures', 'Comptages'].includes(submenu)) {
                                return ['read', 'write'].includes(action);
                              }
                              return true;
                            })
                            .map((action) => {
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
