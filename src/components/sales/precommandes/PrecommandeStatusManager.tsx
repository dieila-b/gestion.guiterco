
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Truck, Package } from 'lucide-react';
import { useGenererBonLivraison } from '@/hooks/precommandes/usePrecommandeMutations';
import type { PrecommandeComplete } from '@/types/precommandes';

interface PrecommandeStatusManagerProps {
  precommande: PrecommandeComplete;
}

const PrecommandeStatusManager = ({ precommande }: PrecommandeStatusManagerProps) => {
  const genererBonLivraison = useGenererBonLivraison();

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'confirmee': return <Clock className="h-4 w-4" />;
      case 'en_preparation': return <Package className="h-4 w-4" />;
      case 'prete': return <CheckCircle className="h-4 w-4" />;
      case 'livree': return <Truck className="h-4 w-4" />;
      case 'annulee': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (statut: string) => {
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

  const handleGenererBonLivraison = async () => {
    try {
      await genererBonLivraison.mutateAsync(precommande.id);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Statut de la précommande</span>
          <Badge variant={getStatusColor(precommande.statut) as any} className="flex items-center gap-1">
            {getStatusIcon(precommande.statut)}
            {getStatusLabel(precommande.statut)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions selon le statut */}
        {precommande.statut === 'prete' && !precommande.bon_livraison_genere && (
          <div className="flex justify-center">
            <Button 
              onClick={handleGenererBonLivraison}
              disabled={genererBonLivraison.isPending}
              className="flex items-center gap-2"
            >
              <Truck className="h-4 w-4" />
              {genererBonLivraison.isPending ? "Génération..." : "Générer bon de livraison"}
            </Button>
          </div>
        )}

        {/* Informations sur le bon de livraison */}
        {precommande.bon_livraison_genere && precommande.bon_livraison && (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Bon de livraison généré</span>
            </div>
            <p className="text-sm text-green-700">
              Numéro: {precommande.bon_livraison.numero_bon}
            </p>
            <p className="text-sm text-green-700">
              Statut: {precommande.bon_livraison.statut}
            </p>
          </div>
        )}

        {/* Notifications en attente */}
        {precommande.notifications && precommande.notifications.filter(n => n.statut === 'en_attente').length > 0 && (
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">
                {precommande.notifications.filter(n => n.statut === 'en_attente').length} notification(s) en attente
              </span>
            </div>
            <p className="text-sm text-orange-700">
              Des notifications sont en attente de lecture par le client.
            </p>
          </div>
        )}

        {/* Informations de stock */}
        <div className="text-sm text-muted-foreground space-y-1">
          {precommande.notification_envoyee && precommande.date_notification && (
            <p>
              Dernière notification: {new Date(precommande.date_notification).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrecommandeStatusManager;

