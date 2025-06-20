
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Package, Truck, Bell, Eye } from 'lucide-react';
import { usePrecommandesComplete } from '@/hooks/precommandes/usePrecommandesComplete';
import { useGenererBonLivraison, useMarquerNotificationVue } from '@/hooks/precommandes/usePrecommandeMutations';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import PrecommandeNotifications from './precommandes/PrecommandeNotifications';
import PrecommandeDetails from './precommandes/PrecommandeDetails';
import CreatePrecommandeDialog from './precommandes/CreatePrecommandeDialog';

const Precommandes = () => {
  const { data: precommandes, isLoading } = usePrecommandesComplete();
  const genererBonLivraison = useGenererBonLivraison();
  const marquerNotificationVue = useMarquerNotificationVue();
  const [selectedPrecommande, setSelectedPrecommande] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'confirmee': return 'Confirmée';
      case 'en_preparation': return 'En préparation';
      case 'prete': return 'Prête';
      case 'livree': return 'Livrée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  };

  const handleGenererBonLivraison = async (precommandeId: string) => {
    try {
      await genererBonLivraison.mutateAsync(precommandeId);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleMarquerNotificationVue = async (notificationId: string) => {
    try {
      await marquerNotificationVue.mutateAsync(notificationId);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Précommandes</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle précommande
        </Button>
      </div>

      <div className="grid gap-4">
        {precommandes?.map((precommande) => (
          <Card key={precommande.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {precommande.numero_precommande}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeColor(precommande.statut) as any}>
                  {getStatusLabel(precommande.statut)}
                </Badge>
                
                {/* Notifications non lues */}
                {precommande.notifications?.filter(n => n.statut === 'en_attente').length > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    <Bell className="h-3 w-3 mr-1" />
                    {precommande.notifications.filter(n => n.statut === 'en_attente').length}
                  </Badge>
                )}

                {/* Actions */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedPrecommande(precommande.id)}
                  title="Voir détails"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {precommande.statut === 'prete' && !precommande.bon_livraison_genere && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleGenererBonLivraison(precommande.id)}
                    title="Générer bon de livraison"
                    disabled={genererBonLivraison.isPending}
                  >
                    <Truck className="h-4 w-4" />
                  </Button>
                )}

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

              {/* Informations supplémentaires */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {precommande.acompte_verse && precommande.acompte_verse > 0 && (
                  <div>
                    <p className="text-muted-foreground">Acompte versé</p>
                    <p className="font-medium">{formatCurrency(precommande.acompte_verse)}</p>
                  </div>
                )}
                
                {precommande.bon_livraison_genere && precommande.bon_livraison && (
                  <div>
                    <p className="text-muted-foreground">Bon de livraison</p>
                    <p className="font-medium">{precommande.bon_livraison.numero_bon}</p>
                  </div>
                )}
                
                {precommande.notification_envoyee && precommande.date_notification && (
                  <div>
                    <p className="text-muted-foreground">Dernière notification</p>
                    <p className="font-medium">
                      {format(new Date(precommande.date_notification), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                )}
              </div>

              {/* Notifications récentes */}
              {precommande.notifications && precommande.notifications.length > 0 && (
                <PrecommandeNotifications 
                  notifications={precommande.notifications.slice(0, 2)} 
                  onMarquerVue={handleMarquerNotificationVue}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog pour les détails */}
      {selectedPrecommande && (
        <PrecommandeDetails 
          precommandeId={selectedPrecommande}
          open={!!selectedPrecommande}
          onClose={() => setSelectedPrecommande(null)}
        />
      )}

      {/* Dialog de création */}
      <CreatePrecommandeDialog 
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
};

export default Precommandes;
