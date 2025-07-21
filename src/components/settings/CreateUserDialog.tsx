
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CreateUserForm from './CreateUserForm';

interface CreateUserDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUserCreated?: () => void;
  children?: React.ReactNode;
}

const CreateUserDialog = ({ open, onOpenChange, onUserCreated, children }: CreateUserDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleSuccess = () => {
    setIsOpen(false);
    onUserCreated?.();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau utilisateur interne</DialogTitle>
        </DialogHeader>
        <CreateUserForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
