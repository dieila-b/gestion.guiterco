
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, FileText, ArrowRight } from 'lucide-react';
import { useDevisVente, useConvertDevisToCommande } from '@/hooks/useSales';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const DevisVente = () => {
  const { data: devis, isLoading } = useDevisVente();
  const convertMutation = useConvertDevisToCommande();
  const { toast } = useToast();

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'brouillon': return 'default';
      case 'envoye': return 'secondary';
      case 'accepte': return 'outline';
      case 'refuse': return 'destructive';
      case 'expire': return 'destructive';
      default: return 'default';
    }
  };

  const handleConvertToCommande = async (devisId: string) => {
    try {
      await convertMutation.mutateAsync(devisId);
      toast({
        title: "Succès",
        description: "Le devis a été converti en commande avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de convertir le devis en commande.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Devis de vente</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau devis
        </Button>
      </div>

      <div className="grid gap-4">
        {devis?.map((devisItem) => (
          <Card key={devisItem.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {devisItem.numero_devis}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeColor(devisItem.statut)}>
                  {devisItem.statut}
                </Badge>
                {devisItem.statut === 'envoye' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConvertToCommande(devisItem.id)}
                    disabled={convertMutation.isPending}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Convertir en commande
                  </Button>
                )}
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
                    {devisItem.client ? `${devisItem.client.nom} ${devisItem.client.prenom || ''}`.trim() : 'Client non spécifié'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date devis</p>
                  <p className="font-medium">
                    {format(new Date(devisItem.date_devis), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Validité</p>
                  <p className="font-medium">
                    {devisItem.date_validite 
                      ? format(new Date(devisItem.date_validite), 'dd/MM/yyyy', { locale: fr })
                      : 'Non définie'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant TTC</p>
                  <p className="font-medium">{devisItem.montant_ttc.toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DevisVente;
