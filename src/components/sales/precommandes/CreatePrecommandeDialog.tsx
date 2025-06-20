
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CreatePrecommandeDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreatePrecommandeDialog = ({ open, onClose }: CreatePrecommandeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une nouvelle précommande</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-muted-foreground mb-4">
            La fonctionnalité de création de précommandes sera bientôt disponible.
          </p>
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePrecommandeDialog;
