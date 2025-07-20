
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
    console.log('✅ Utilisateur mis à jour avec succès, fermeture du modal');
    setError(null);
    setIsOpen(false);
    onUserUpdated?.();
  };

  const handleCancel = () => {
    console.log('❌ Annulation de la modification utilisateur');
    setError(null);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
    }
    setIsOpen(open);
  };

  // Vérification robuste des données utilisateur
  if (!user || !user.id || !user.user_id) {
    console.error('❌ Données utilisateur invalides pour EditUserDialog:', user);
    return (
      <Button variant="outline" size="sm" disabled className="opacity-50">
        <AlertCircle className="h-4 w-4 text-red-500" />
      </Button>
    );
  }

  // Transformer le user pour correspondre exactement à l'interface attendue par EditUserForm
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

  console.log('🔍 Données utilisateur transformées pour EditUserForm:', {
    id: transformedUser.id,
    user_id: transformedUser.user_id,
    role: transformedUser.role,
    statut: transformedUser.statut
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="hover:bg-accent">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            Modifier l'utilisateur - {transformedUser.prenom} {transformedUser.nom}
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <EditUserForm 
            user={transformedUser} 
            onSuccess={handleSuccess} 
            onCancel={handleCancel} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
