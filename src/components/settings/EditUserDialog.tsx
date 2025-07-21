
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, AlertCircle } from 'lucide-react';
import EditUserForm from './EditUserForm';
import { UtilisateurInterneWithRole } from '@/hooks/useUtilisateursInternes';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditUserDialogProps {
  user: UtilisateurInterneWithRole;
  onUserUpdated?: () => void;
  children?: React.ReactNode;
}

const EditUserDialog = ({ user, onUserUpdated, children }: EditUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    setError(null);
    setIsOpen(false);
    onUserUpdated?.();
  };

  const handleCancel = () => {
    setError(null);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
    }
    setIsOpen(open);
  };

  // Vérification des données utilisateur
  if (!user || !user.id || !user.user_id) {
    console.error('❌ Invalid user data for EditUserDialog:', user);
    return (
      <Button variant="outline" size="sm" disabled>
        <AlertCircle className="h-4 w-4 text-red-500" />
      </Button>
    );
  }

  // Transformer le user pour correspondre à l'interface attendue par EditUserForm
  const transformedUser = {
    id: user.id,
    user_id: user.user_id,
    prenom: user.prenom || '',
    nom: user.nom || '',
    email: user.email || '',
    telephone: user.telephone || '',
    adresse: user.adresse || '',
    photo_url: user.photo_url || '',
    role: user.role ? {
      id: user.role.id,
      name: user.role.name
    } : null,
    matricule: user.matricule || '',
    statut: user.statut || 'actif',
    doit_changer_mot_de_passe: user.doit_changer_mot_de_passe || false
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Modifier l'utilisateur - {transformedUser.prenom} {transformedUser.nom}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
