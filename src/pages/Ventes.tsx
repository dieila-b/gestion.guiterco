
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Ventes = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ventes</h1>
          <p className="text-muted-foreground">Gestion des ventes et factures</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle vente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Historique des ventes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune vente</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par enregistrer votre première vente
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle vente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
