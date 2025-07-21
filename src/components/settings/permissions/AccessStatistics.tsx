
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Shield, Activity, Settings } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export const AccessStatistics = () => {
  const { roles, permissions, loading } = usePermissions();

  // Calculer les statistiques de base
  const totalRoles = roles.length;
  const totalPermissions = permissions.length;
  const systemRoles = roles.filter(role => role.is_system).length;
  const customRoles = totalRoles - systemRoles;

  // Grouper les permissions par menu
  const menuGroups = permissions.reduce((acc, perm) => {
    if (!acc[perm.menu]) {
      acc[perm.menu] = 0;
    }
    acc[perm.menu]++;
    return acc;
  }, {} as Record<string, number>);

  const getMenuColor = (menu: string) => {
    switch (menu) {
      case 'Dashboard':
        return 'bg-blue-500';
      case 'Catalogue':
        return 'bg-green-500';
      case 'Ventes':
        return 'bg-orange-500';
      case 'Stock':
        return 'bg-purple-500';
      case 'Clients':
        return 'bg-pink-500';
      case 'Paramètres':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Statistiques générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Statistiques Générales</span>
          </CardTitle>
          <CardDescription>
            Vue d'ensemble des rôles et permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalRoles}</p>
              <p className="text-sm text-muted-foreground">Rôles total</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Settings className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{totalPermissions}</p>
              <p className="text-sm text-muted-foreground">Permissions</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rôles système</span>
              <Badge variant="outline">{systemRoles}</Badge>
            </div>
            <Progress 
              value={totalRoles > 0 ? (systemRoles / totalRoles) * 100 : 0} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rôles personnalisés</span>
              <Badge variant="outline">{customRoles}</Badge>
            </div>
            <Progress 
              value={totalRoles > 0 ? (customRoles / totalRoles) * 100 : 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Répartition par menus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Permissions par Menu</span>
          </CardTitle>
          <CardDescription>
            Distribution des permissions par module
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(menuGroups).length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune permission configurée
            </p>
          ) : (
            Object.entries(menuGroups).map(([menu, count]) => {
              const percentage = totalPermissions > 0 ? (count / totalPermissions) * 100 : 0;
              return (
                <div key={menu} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${getMenuColor(menu)}`}
                      ></div>
                      <span className="text-sm font-medium">{menu}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{count}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })
          )}
          
          {Object.keys(menuGroups).length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total des menus</span>
                <Badge>{Object.keys(menuGroups).length}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
