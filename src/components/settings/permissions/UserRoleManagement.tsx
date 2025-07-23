
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from 'lucide-react';

const UserRoleManagement = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <CardDescription>
                Assignez et gérez les rôles des utilisateurs système
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Fonctionnalité en cours de développement</p>
            <p className="text-sm text-amber-700">
              Le système de gestion des utilisateurs sera bientôt disponible avec une nouvelle architecture.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleManagement;
