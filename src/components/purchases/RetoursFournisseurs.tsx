
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { useRetoursFournisseurs } from '@/hooks/usePurchases';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

const RetoursFournisseurs = () => {
  const { retoursFournisseurs, isLoading } = useRetoursFournisseurs();

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
        <h2 className="text-2xl font-bold">Retours fournisseurs</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau retour
        </Button>
      </div>

      <div className="grid gap-4">
        {retoursFournisseurs?.map((retour) => (
          <Card key={retour.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {retour.numero_retour}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeColor(retour.statut)}>
                  {retour.statut}
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
                  <p className="font-medium">{retour.fournisseur}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Motif</p>
                  <p className="font-medium">{retour.motif_retour}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant</p>
                  <p className="font-medium">{formatCurrency(retour.montant_retour)}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-muted-foreground text-sm">Date de retour</p>
                <p className="text-sm">
                  {format(new Date(retour.date_retour), 'dd/MM/yyyy', { locale: fr })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RetoursFournisseurs;
