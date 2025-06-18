
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import EditUserForm from './EditUserForm';

interface EditUserDialogProps {
  user: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    adresse?: string;
    photo_url?: string;
    role: { nom: string } | null;
    role_id?: string;
    doit_changer_mot_de_passe: boolean;
    statut: string;
  };
  onUserUpdated?: () => void;
}

const EditUserDialog = ({ user, onUserUpdated }: EditUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onUserUpdated?.();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
        </DialogHeader>
        <EditUserForm 
          user={user} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
