
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function AccessControlTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Contrôle d'Accès
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-muted-foreground">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Fonctionnalité de contrôle d'accès en développement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
