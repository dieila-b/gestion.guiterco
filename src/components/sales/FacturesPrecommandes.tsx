
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, FileText } from 'lucide-react';
import { useFacturesPrecommandes } from '@/hooks/useSales';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const FacturesPrecommandes = () => {
  const { data: factures, isLoading } = useFacturesPrecommandes();

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'default';
      case 'payee': return 'outline';
      case 'en_retard': return 'destructive';
      default: return 'default';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'acompte': return 'secondary';
      case 'solde': return 'default';
      case 'complete': return 'outline';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Factures de précommandes</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      <div className="grid gap-4">
        {factures?.map((facture) => (
          <Card key={facture.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {facture.numero_facture}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={getTypeBadgeColor(facture.type_facture)}>
                  {facture.type_facture}
                </Badge>
                <Badge variant={getStatusBadgeColor(facture.statut_paiement)}>
                  {facture.statut_paiement}
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
                    {facture.client ? `${facture.client.nom} ${facture.client.prenom || ''}`.trim() : 'Client non spécifié'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Précommande</p>
                  <p className="font-medium">
                    {facture.precommande ? facture.precommande.numero_precommande : 'Non liée'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date facture</p>
                  <p className="font-medium">
                    {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant TTC</p>
                  <p className="font-medium">{facture.montant_ttc.toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FacturesPrecommandes;
