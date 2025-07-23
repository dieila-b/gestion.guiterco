
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Activity, Settings, AlertTriangle } from 'lucide-react';
import { useRoles } from '@/hooks/usePermissions';

const AccessStatistics = () => {
  const { data: roles = [] } = useRoles();

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
            Vue d'ensemble des rôles configurés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Données utilisateurs indisponibles</p>
              <p className="text-sm text-amber-700">
                Les statistiques utilisateurs seront disponibles après reconstruction du système.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{roles.length}</p>
              <p className="text-sm text-muted-foreground">Rôles configurés</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">-</p>
              <p className="text-sm text-muted-foreground">Utilisateurs (bientôt)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Répartition par rôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Rôles Disponibles</span>
          </CardTitle>
          <CardDescription>
            Liste des rôles configurés dans le système
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {roles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun rôle configuré
            </p>
          ) : (
            roles.map((role, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{role.name}</span>
                </div>
                <Badge variant="outline">Configuré</Badge>
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
