
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

export default function AccessControlTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Contrôle d'Accès Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Fonctionnalité temporairement indisponible</p>
              <p className="text-sm text-amber-700">
                Le système de gestion des utilisateurs et des rôles sera bientôt reconstruit.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
