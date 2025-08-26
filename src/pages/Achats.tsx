
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from 'lucide-react';

const Achats = () => {
  return (
    <AppLayout title="Achats">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6" />
              <CardTitle>Gestion des Achats</CardTitle>
            </div>
            <CardDescription>
              Module de gestion des achats et fournisseurs
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

export default Achats;
