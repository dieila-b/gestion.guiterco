
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, CreditCard } from 'lucide-react';
import { useVersementsClients } from '@/hooks/useSales';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const VersementsClients = () => {
  const { data: versements, isLoading } = useVersementsClients();

  const getPaymentMethodBadge = (mode: string) => {
    switch (mode) {
      case 'especes': return { color: 'default', icon: '💵' };
      case 'carte': return { color: 'secondary', icon: '💳' };
      case 'virement': return { color: 'outline', icon: '🏦' };
      case 'cheque': return { color: 'secondary', icon: '📝' };
      default: return { color: 'default', icon: '💰' };
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Versements clients</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau versement
        </Button>
      </div>

      <div className="grid gap-4">
        {versements?.map((versement) => {
          const paymentBadge = getPaymentMethodBadge(versement.mode_paiement);
          return (
            <Card key={versement.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {versement.numero_versement}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={paymentBadge.color as any}>
                    {paymentBadge.icon} {versement.mode_paiement}
                  </Badge>
                  <Button variant="ghost" size="sm" title="Détails paiement">
                    <CreditCard className="h-4 w-4" />
                  </Button>
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
                    <p className="text-muted-foreground">Client</p>
                    <p className="font-medium">
                      {versement.client ? `${versement.client.nom} ${versement.client.prenom || ''}`.trim() : 'Client non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date versement</p>
                    <p className="font-medium">
                      {format(new Date(versement.date_versement), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Montant</p>
                    <p className="font-medium text-green-600">{versement.montant.toFixed(2)} €</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Référence</p>
                    <p className="font-medium">{versement.reference_paiement || 'Non spécifiée'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default VersementsClients;
