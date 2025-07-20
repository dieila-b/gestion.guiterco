
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Shield, Activity, Settings } from 'lucide-react';
import { useRoles } from '@/hooks/usePermissions';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';

const AccessStatistics = () => {
  const { data: roles = [] } = useRoles();
  const { data: users = [] } = useUtilisateursInternes();

  // Calculer les statistiques
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.statut === 'actif').length;
  const usersWithRoles = users.filter(user => user.role).length;
  const usersWithoutRoles = totalUsers - usersWithRoles;

  // Statistiques par rôle
  const roleStats = roles.map(role => {
    const userCount = users.filter(user => user.role?.id === role.id).length;
    const percentage = totalUsers > 0 ? (userCount / totalUsers) * 100 : 0;
    return {
      role: role.name,
      count: userCount,
      percentage: Math.round(percentage)
    };
  });

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrateur':
        return 'bg-red-500';
      case 'manager':
        return 'bg-blue-500';
      case 'vendeur':
        return 'bg-green-500';
      case 'caissier':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

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
            Vue d'ensemble des utilisateurs et accès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total utilisateurs</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Utilisateurs avec rôles</span>
              <Badge variant="outline">{usersWithRoles}/{totalUsers}</Badge>
            </div>
            <Progress 
              value={totalUsers > 0 ? (usersWithRoles / totalUsers) * 100 : 0} 
              className="h-2"
            />
            
            {usersWithoutRoles > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-600">Sans rôle assigné</span>
                  <Badge variant="destructive">{usersWithoutRoles}</Badge>
                </div>
                <Progress 
                  value={totalUsers > 0 ? (usersWithoutRoles / totalUsers) * 100 : 0} 
                  className="h-2"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Répartition par rôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Répartition par Rôles</span>
          </CardTitle>
          <CardDescription>
            Distribution des utilisateurs par rôle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {roleStats.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun rôle configuré
            </p>
          ) : (
            roleStats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${getRoleColor(stat.role)}`}
                    ></div>
                    <span className="text-sm font-medium">{stat.role}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{stat.count}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {stat.percentage}%
                    </span>
                  </div>
                </div>
                <Progress value={stat.percentage} className="h-2" />
              </div>
            ))
          )}
          
          {roles.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total des rôles</span>
                <Badge>{roles.length}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessStatistics;
