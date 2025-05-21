
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import AddCashRegisterForm from './AddCashRegisterForm';

interface AddCashRegisterDialogProps {
  onRegisterCreated?: (data: { name: string; initialBalance: number }) => void;
}

const AddCashRegisterDialog: React.FC<AddCashRegisterDialogProps> = ({ onRegisterCreated }) => {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = (data: { name: string; initialBalance: number }) => {
    if (onRegisterCreated) {
      onRegisterCreated(data);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Nouvelle caisse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle caisse</DialogTitle>
        </DialogHeader>
        <AddCashRegisterForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default AddCashRegisterDialog;
