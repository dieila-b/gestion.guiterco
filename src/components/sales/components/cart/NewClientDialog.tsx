
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewClientForm from '../NewClientForm';

interface NewClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (clientId: string, clientName: string) => void;
}

const NewClientDialog: React.FC<NewClientDialogProps> = ({
  isOpen,
  onClose,
  onClientCreated
}) => {
  const handleClientCreated = (clientData: { id: string; nom: string }) => {
    console.log('Client créé avec succès:', clientData);
    onClientCreated(clientData.id, clientData.nom);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau client</DialogTitle>
          <DialogDescription>
            Créer un nouveau client pour la vente
          </DialogDescription>
        </DialogHeader>
        
        <NewClientForm onClientCreated={handleClientCreated} />
      </DialogContent>
    </Dialog>
  );
};

export default NewClientDialog;
