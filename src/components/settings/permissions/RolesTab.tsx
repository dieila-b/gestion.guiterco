
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

const RolesTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Gestion des Rôles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Fonctionnalité en développement</p>
            <p className="text-sm text-amber-700">
              La gestion des rôles sera disponible prochainement.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RolesTab;
