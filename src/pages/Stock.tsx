
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Stock = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock</h1>
          <p className="text-muted-foreground">Gestion des stocks et inventaires</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Mouvement de stock
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            État des stocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun stock</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par configurer vos stocks
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Configurer le stock
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
