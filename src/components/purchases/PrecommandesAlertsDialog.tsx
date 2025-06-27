
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Package, Users } from 'lucide-react';

interface PrecommandeAlert {
  article_id: string;
  article_nom: string;
  total_en_attente: number;
  nb_precommandes: number;
}

interface PrecommandesAlertsDialogProps {
  open: boolean;
  onClose: () => void;
  alerts: PrecommandeAlert[];
  onConfirm: () => void;
}

const PrecommandesAlertsDialog = ({ 
  open, 
  onClose, 
  alerts, 
  onConfirm 
}: PrecommandesAlertsDialogProps) => {
  
  if (alerts.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Précommandes en attente détectées
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Les articles suivants ont des précommandes en attente. Pensez à vérifier 
            les notifications de précommandes après validation du bon de livraison.
          </p>

          {alerts.map((alert, index) => (
            <Alert key={alert.article_id} className="border-orange-200 bg-orange-50">
              <Package className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-orange-800">
                    🔔 Article : <strong>{alert.article_nom}</strong>
                  </p>
                  
                  <div className="text-sm text-orange-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3" />
                      <span><strong>Quantité totale demandée :</strong> {alert.total_en_attente} unités</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span><strong>Nombre de précommandes :</strong> {alert.nb_precommandes}</span>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}

          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Recommandation :</strong> Vérifiez l'onglet "Précommandes" pour traiter 
              les commandes en attente et éviter les ruptures de stock.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler l'approbation
          </Button>
          <Button onClick={onConfirm} className="bg-orange-600 hover:bg-orange-700">
            Continuer l'approbation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrecommandesAlertsDialog;
