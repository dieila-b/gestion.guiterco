
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
import { AlertTriangle, Package } from 'lucide-react';

interface PrecommandeAlertInfo {
  article_nom: string;
  total_en_precommande: number;
  total_deja_livre: number;
  reste_a_livrer: number;
  nb_precommandes: number;
}

interface PrecommandeAlertDialogProps {
  open: boolean;
  onClose: () => void;
  alertInfo: PrecommandeAlertInfo | null;
  onConfirm: () => void;
}

const PrecommandeAlertDialog = ({ 
  open, 
  onClose, 
  alertInfo, 
  onConfirm 
}: PrecommandeAlertDialogProps) => {
  
  if (!alertInfo || alertInfo.reste_a_livrer === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Article en précommande
          </DialogTitle>
        </DialogHeader>
        
        <Alert className="border-orange-200 bg-orange-50">
          <Package className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-orange-800">
                L'article "<strong>{alertInfo.article_nom}</strong>" est actuellement en précommande.
              </p>
              
              <div className="text-sm text-orange-700 space-y-1">
                <div>📦 <strong>Quantité totale en précommande :</strong> {alertInfo.total_en_precommande} unités</div>
                <div>✅ <strong>Déjà livrées :</strong> {alertInfo.total_deja_livre} unités</div>
                <div>⏳ <strong>Reste à livrer :</strong> {alertInfo.reste_a_livrer} unités</div>
                <div>👥 <strong>Nombre de précommandes :</strong> {alertInfo.nb_precommandes}</div>
              </div>
              
              <p className="text-sm text-orange-600 mt-3">
                Pensez à vérifier les notifications de précommandes après validation du bon de livraison.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onConfirm} className="bg-orange-600 hover:bg-orange-700">
            Continuer la validation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrecommandeAlertDialog;
