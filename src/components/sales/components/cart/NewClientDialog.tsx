
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import NewClientForm from '@/components/sales/components/NewClientForm';

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (clientId: string, clientName: string) => void;
}

const NewClientDialog: React.FC<NewClientDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const handleSuccess = (clientName: string) => {
    // Pour récupérer l'ID du client créé, nous devrons ajuster la logique
    // Pour l'instant, nous utilisons le nom comme identifiant temporaire
    onSuccess('temp-id', clientName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 bg-white m-0 rounded-none">
        <DialogHeader className="p-6 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-gray-800">Nouveau Client</DialogTitle>
          <DialogDescription>
            Créer un nouveau client pour cette vente
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-6 overflow-y-auto">
          <NewClientForm 
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientDialog;
