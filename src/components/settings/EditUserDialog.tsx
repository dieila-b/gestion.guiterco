
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import EditUserForm from './EditUserForm';
import { UtilisateurInterne } from '@/hooks/useUtilisateursInternes';

interface EditUserDialogProps {
  user: UtilisateurInterne;
  onUserUpdated?: () => void;
  children?: React.ReactNode;
}

const EditUserDialog = ({ user, onUserUpdated, children }: EditUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onUserUpdated?.();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Transformer le user pour correspondre à l'interface attendue par EditUserForm
  const transformedUser = {
    id: user.id,
    user_id: user.user_id,
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    telephone: user.telephone,
    adresse: user.adresse,
    photo_url: user.photo_url,
    role: user.role ? {
      id: user.role.id,
      name: user.role.name
    } : null,
    matricule: user.matricule,
    statut: user.statut,
    doit_changer_mot_de_passe: user.doit_changer_mot_de_passe
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
        </DialogHeader>
        <EditUserForm 
          user={transformedUser} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
