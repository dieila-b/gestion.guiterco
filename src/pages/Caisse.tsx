
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Caisse = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Caisse</h1>
          <p className="text-muted-foreground">Gestion de la caisse et transactions</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transactions du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune transaction</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par enregistrer vos premières transactions
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle transaction
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
