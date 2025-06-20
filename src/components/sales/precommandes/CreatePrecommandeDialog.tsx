
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreatePrecommandeForm from './CreatePrecommandeForm';

interface CreatePrecommandeDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreatePrecommandeDialog = ({ open, onClose }: CreatePrecommandeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle précommande</DialogTitle>
        </DialogHeader>
        <CreatePrecommandeForm onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePrecommandeDialog;
