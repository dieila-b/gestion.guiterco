import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Package } from 'lucide-react';
import { usePrecommandes } from '@/hooks/useSales';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

const Precommandes = () => {
  const { data: precommandes, isLoading } = usePrecommandes();

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'confirmee': return 'default';
      case 'en_preparation': return 'secondary';
      case 'prete': return 'outline';
      case 'livree': return 'outline';
      case 'annulee': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Précommandes</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle précommande
        </Button>
      </div>

      <div className="grid gap-4">
        {precommandes?.map((precommande) => (
          <Card key={precommande.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {precommande.numero_precommande}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeColor(precommande.statut)}>
                  {precommande.statut}
                </Badge>
                <Button variant="ghost" size="sm" title="Gérer stock">
                  <Package className="h-4 w-4" />
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
                    {precommande.client ? precommande.client.nom : 'Client non spécifié'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date précommande</p>
                  <p className="font-medium">
                    {format(new Date(precommande.date_precommande), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Livraison prévue</p>
                  <p className="font-medium">
                    {precommande.date_livraison_prevue 
                      ? format(new Date(precommande.date_livraison_prevue), 'dd/MM/yyyy', { locale: fr })
                      : 'Non définie'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant TTC</p>
                  <p className="font-medium">{formatCurrency(precommande.montant_ttc)}</p>
                </div>
              </div>
              {precommande.acompte_verse && precommande.acompte_verse > 0 && (
                <div className="mt-4">
                  <p className="text-muted-foreground text-sm">Acompte versé</p>
                  <p className="text-sm font-medium">{formatCurrency(precommande.acompte_verse)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Precommandes;
