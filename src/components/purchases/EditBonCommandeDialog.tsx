
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { EditBonCommandeForm } from './EditBonCommandeForm';

interface EditBonCommandeDialogProps {
  bon: any;
  onSuccess?: () => void;
}

export const EditBonCommandeDialog = ({ bon, onSuccess }: EditBonCommandeDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  // Empêcher l'édition des bons approuvés
  if (bon.statut !== 'en_cours') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
        onClick={() => setOpen(true)}
        title="Éditer"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Éditer le bon de commande {bon.numero_bon}</DialogTitle>
        </DialogHeader>
        <EditBonCommandeForm bon={bon} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};
