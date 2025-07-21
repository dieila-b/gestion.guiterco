
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Warehouse } from 'lucide-react';

const DepotsStockage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Warehouse className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Dépôts de Stockage</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des dépôts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Warehouse className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Gestion des dépôts de stockage disponible prochainement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepotsStockage;
