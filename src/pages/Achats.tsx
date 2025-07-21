
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Achats = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Achats</h1>
          <p className="text-muted-foreground">Gestion des achats et fournisseurs</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvel achat
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Historique des achats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun achat</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par enregistrer vos premiers achats
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel achat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
