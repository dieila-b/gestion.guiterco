
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateBonCommandeForm } from './CreateBonCommandeForm';

interface CreateBonCommandeDialogProps {
  onSuccess?: () => void;
}

export const CreateBonCommandeDialog = ({ onSuccess }: CreateBonCommandeDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau bon de commande
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau bon de commande</DialogTitle>
        </DialogHeader>
        <CreateBonCommandeForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};
