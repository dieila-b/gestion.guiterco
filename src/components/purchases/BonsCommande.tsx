
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { useBonsCommande } from '@/hooks/usePurchases';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BonsCommande = () => {
  const { bonsCommande, isLoading } = useBonsCommande();

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'default';
      case 'valide': return 'secondary';
      case 'livre': return 'outline';
      case 'annule': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bons de commande</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau bon de commande
        </Button>
      </div>

      <div className="grid gap-4">
        {bonsCommande?.map((bon) => (
          <Card key={bon.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {bon.numero_bon}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeColor(bon.statut)}>
                  {bon.statut}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Fournisseur</p>
                  <p className="font-medium">{bon.fournisseur}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date de commande</p>
                  <p className="font-medium">
                    {format(new Date(bon.date_commande), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant total</p>
                  <p className="font-medium">{bon.montant_total.toFixed(2)} €</p>
                </div>
              </div>
              {bon.observations && (
                <div className="mt-4">
                  <p className="text-muted-foreground text-sm">Observations</p>
                  <p className="text-sm">{bon.observations}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BonsCommande;
