
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { useFacturesAchat } from '@/hooks/usePurchases';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const FacturesAchat = () => {
  const { facturesAchat, isLoading } = useFacturesAchat();

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'default';
      case 'payee': return 'secondary';
      case 'en_retard': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Factures d'achat</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      <div className="grid gap-4">
        {facturesAchat?.map((facture) => (
          <Card key={facture.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {facture.numero_facture}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeColor(facture.statut_paiement)}>
                  {facture.statut_paiement}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Fournisseur</p>
                  <p className="font-medium">{facture.fournisseur}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date facture</p>
                  <p className="font-medium">
                    {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant HT</p>
                  <p className="font-medium">{facture.montant_ht.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant TTC</p>
                  <p className="font-medium">{facture.montant_ttc.toFixed(2)} €</p>
                </div>
              </div>
              {facture.date_echeance && (
                <div className="mt-4">
                  <p className="text-muted-foreground text-sm">Date d'échéance</p>
                  <p className="text-sm">
                    {format(new Date(facture.date_echeance), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FacturesAchat;
