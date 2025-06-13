
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import NewClientForm from '@/components/sales/components/NewClientForm';

interface NewClientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (clientData: { id: string; nom: string }) => void;
}

const NewClientDialog: React.FC<NewClientDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  onClientCreated 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-none w-screen h-screen p-0 bg-white m-0 rounded-none">
        <DialogHeader className="p-6 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-gray-800">Nouveau Client</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-6 overflow-y-auto">
          <NewClientForm 
            onClientCreated={onClientCreated}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientDialog;
