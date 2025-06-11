
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Eye } from 'lucide-react';
import { useCommandesClients } from '@/hooks/useSales';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const VenteComptoir = () => {
  const { data: commandes, isLoading } = useCommandesClients();

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'default';
      case 'confirmee': return 'secondary';
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
        <h2 className="text-2xl font-bold">Vente au comptoir</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle vente
        </Button>
      </div>

      <div className="grid gap-4">
        {commandes?.map((commande) => (
          <Card key={commande.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {commande.numero_commande}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeColor(commande.statut)}>
                  {commande.statut}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
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
                    {commande.client ? `${commande.client.nom} ${commande.client.prenom || ''}`.trim() : 'Client non spécifié'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(commande.date_commande), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant TTC</p>
                  <p className="font-medium">{commande.montant_ttc.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mode de paiement</p>
                  <p className="font-medium">{commande.mode_paiement || 'Non spécifié'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VenteComptoir;
