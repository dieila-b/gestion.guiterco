
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from 'lucide-react';

const Caisse = () => {
  return (
    <AppLayout title="Caisse">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6" />
              <CardTitle>Gestion de la Caisse</CardTitle>
            </div>
            <CardDescription>
              Module de gestion de la caisse et des paiements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cette fonctionnalité sera bientôt disponible.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Caisse;
