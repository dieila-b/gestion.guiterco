
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, RotateCcw, Package } from 'lucide-react';
import { useRetoursClients } from '@/hooks/useSales';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const RetoursClients = () => {
  const { data: retours, isLoading } = useRetoursClients();

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'default';
      case 'accepte': return 'secondary';
      case 'refuse': return 'destructive';
      case 'rembourse': return 'outline';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Retours clients</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau retour
        </Button>
      </div>

      <div className="grid gap-4">
        {retours?.map((retour) => (
          <Card key={retour.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {retour.numero_retour}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeColor(retour.statut)}>
                  {retour.statut}
                </Badge>
                <Button variant="ghost" size="sm" title="Gérer articles">
                  <Package className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Processus de retour">
                  <RotateCcw className="h-4 w-4" />
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
                    {retour.client ? `${retour.client.nom} ${retour.client.prenom || ''}`.trim() : 'Client non spécifié'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date retour</p>
                  <p className="font-medium">
                    {format(new Date(retour.date_retour), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Motif</p>
                  <p className="font-medium">{retour.motif_retour}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant retour</p>
                  <p className="font-medium">{retour.montant_retour.toFixed(2)} €</p>
                </div>
              </div>
              {retour.facture && (
                <div className="mt-4">
                  <p className="text-muted-foreground text-sm">Facture liée</p>
                  <p className="text-sm font-medium">{retour.facture.numero_facture}</p>
                </div>
              )}
              {retour.date_remboursement && (
                <div className="mt-2">
                  <p className="text-muted-foreground text-sm">Date remboursement</p>
                  <p className="text-sm font-medium">
                    {format(new Date(retour.date_remboursement), 'dd/MM/yyyy', { locale: fr })}
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

export default RetoursClients;
