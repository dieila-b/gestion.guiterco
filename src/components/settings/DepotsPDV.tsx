
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store } from 'lucide-react';

const DepotsPDV = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Dépôts PDV</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des points de vente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Gestion des points de vente disponible prochainement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepotsPDV;
