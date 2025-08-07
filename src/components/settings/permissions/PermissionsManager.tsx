
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import RoleCardsView from './RoleCardsView';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function PermissionsManager() {
  return (
    <PermissionGuard menu="Paramètres" submenu="Rôles et permissions" action="read">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Gestion des Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoleCardsView />
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
