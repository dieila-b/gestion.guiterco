
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePrecommandesComplete } from '@/hooks/precommandes/usePrecommandesComplete';
import { useNotificationsPrecommandes } from '@/hooks/precommandes/useNotificationsPrecommandes';
import { useStockDisponibilite } from '@/hooks/precommandes/useStockDisponibilite';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Package, Truck, Bell } from 'lucide-react';
import PrecommandeNotifications from './PrecommandeNotifications';
import PrecommandeStatusManager from './PrecommandeStatusManager';
import { useMarquerNotificationVue } from '@/hooks/precommandes/usePrecommandeMutations';

interface PrecommandeDetailsProps {
  precommandeId: string;
  open: boolean;
  onClose: () => void;
}

const PrecommandeDetails = ({ precommandeId, open, onClose }: PrecommandeDetailsProps) => {
  const { data: precommandes } = usePrecommandesComplete();
  const { data: notifications } = useNotificationsPrecommandes(precommandeId);
  const marquerNotificationVue = useMarquerNotificationVue();

  const precommande = precommandes?.find(p => p.id === precommandeId);

  const handleMarquerNotificationVue = async (notificationId: string) => {
    try {
      await marquerNotificationVue.mutateAsync(notificationId);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (!precommande) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Détails de la précommande {precommande.numero_precommande}</span>
            <Badge variant="secondary">
              {precommande.statut}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Gestionnaire de statut */}
          <PrecommandeStatusManager precommande={precommande} />

          <Separator />

          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Informations client</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nom:</span> {precommande.client?.nom}</p>
                <p><span className="font-medium">Email:</span> {precommande.client?.email || 'Non renseigné'}</p>
                <p><span className="font-medium">Téléphone:</span> {precommande.client?.telephone || 'Non renseigné'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Informations précommande</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Date:</span> {format(new Date(precommande.date_precommande), 'dd/MM/yyyy', { locale: fr })}</p>
                <p><span className="font-medium">Livraison prévue:</span> {precommande.date_livraison_prevue ? format(new Date(precommande.date_livraison_prevue), 'dd/MM/yyyy', { locale: fr }) : 'Non définie'}</p>
                <p><span className="font-medium">Montant TTC:</span> {formatCurrency(precommande.montant_ttc)}</p>
                {precommande.acompte_verse && (
                  <p><span className="font-medium">Acompte versé:</span> {formatCurrency(precommande.acompte_verse)}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Articles commandés */}
          <div>
            <h3 className="font-medium mb-3">Articles commandés</h3>
            <div className="space-y-2">
              {precommande.lignes_precommande?.map((ligne) => (
                <LignePrecommandeDetail key={ligne.id} ligne={ligne} />
              ))}
            </div>
          </div>

          {/* Notifications */}
          {notifications && notifications.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <Bell className="mr-2 h-4 w-4" />
                  Historique des notifications
                </h3>
                <PrecommandeNotifications 
                  notifications={notifications} 
                  onMarquerVue={handleMarquerNotificationVue}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LignePrecommandeDetail = ({ ligne }: { ligne: any }) => {
  const { data: stock } = useStockDisponibilite(ligne.article_id);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <p className="font-medium">{ligne.article?.nom}</p>
        <p className="text-sm text-muted-foreground">Ref: {ligne.article?.reference}</p>
      </div>
      <div className="text-right">
        <p className="font-medium">Qté: {ligne.quantite}</p>
        <p className="text-sm text-muted-foreground">{formatCurrency(ligne.prix_unitaire)} / unité</p>
      </div>
      <div className="text-right ml-4">
        <p className="font-medium">{formatCurrency(ligne.montant_ligne)}</p>
        {stock && (
          <div className="text-sm">
            <Badge variant={stock.total >= ligne.quantite ? "outline" : "destructive"}>
              <Package className="mr-1 h-3 w-3" />
              Stock: {stock.total}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrecommandeDetails;

