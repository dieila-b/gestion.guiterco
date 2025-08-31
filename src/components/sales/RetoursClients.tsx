
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

// Utilisation de données mock pour éviter l'erreur
const RetoursClients = () => {
  const isLoading = false;
  const retours = []; // Données vides pour l'instant

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'default';
      case 'accepte': return 'outline';
      case 'refuse': return 'destructive';
      case 'rembourse': return 'secondary';
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
        {Array.isArray(retours) && retours.length > 0 ? (
          retours.map((retour: any) => (
            <Card key={retour.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {retour.numero_retour}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusBadgeColor(retour.statut) as any}>
                    {retour.statut}
                  </Badge>
                  <Button variant="ghost" size="sm" title="Voir PDF">
                    <FileText className="h-4 w-4" />
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
                      {retour.client ? retour.client.nom : 'Client non spécifié'}
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
                    <p className="text-muted-foreground">Montant</p>
                    <p className="font-medium">{formatCurrency(retour.montant_retour)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Aucun retour client trouvé</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RetoursClients;
