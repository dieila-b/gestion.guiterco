
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

const Fournisseurs = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Fournisseurs</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des fournisseurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Gestion des fournisseurs disponible prochainement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fournisseurs;
