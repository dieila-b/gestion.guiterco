
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EditBonCommandeForm } from './EditBonCommandeForm';

interface EditBonCommandeDialogProps {
  bon: any;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditBonCommandeDialog = ({ bon, open, onClose, onSuccess }: EditBonCommandeDialogProps) => {
  const handleSuccess = () => {
    onClose();
    onSuccess?.();
  };

  // Empêcher l'édition des bons approuvés
  if (bon.statut !== 'en_cours') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Éditer le bon de commande {bon.numero_bon}</DialogTitle>
        </DialogHeader>
        <EditBonCommandeForm bon={bon} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};
