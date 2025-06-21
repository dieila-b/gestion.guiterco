
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useDeletePrecommande } from '@/hooks/precommandes/useUpdatePrecommande';

interface DeletePrecommandeDialogProps {
  precommande: PrecommandeComplete | null;
  open: boolean;
  onClose: () => void;
}

const DeletePrecommandeDialog = ({ precommande, open, onClose }: DeletePrecommandeDialogProps) => {
  const deletePrecommande = useDeletePrecommande();

  const handleDelete = async () => {
    if (!precommande) return;

    try {
      await deletePrecommande.mutateAsync(precommande.id);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la précommande{' '}
            <strong>{precommande?.numero_precommande}</strong> ?
            <br />
            <br />
            Cette action est irréversible et supprimera toutes les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePrecommande.isPending}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={deletePrecommande.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deletePrecommande.isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePrecommandeDialog;
