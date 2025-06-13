
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewClientForm from '../NewClientForm';

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (clientName: string) => void;
}

const NewClientDialog: React.FC<NewClientDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const handleSuccess = (clientName: string) => {
    onSuccess(clientName);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 bg-gray-900 m-0 rounded-none">
        <DialogHeader className="p-6 border-b border-gray-700">
          <DialogTitle className="text-2xl font-bold text-purple-400">Nouveau Client</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-6 overflow-y-auto">
          <NewClientForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientDialog;
