
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useBonLivraisonDelete } from '@/hooks/useBonLivraisonDelete';

interface DeleteBonLivraisonDialogProps {
  bon: any;
  disabled?: boolean;
}

export const DeleteBonLivraisonDialog = ({ bon, disabled }: DeleteBonLivraisonDialogProps) => {
  const [open, setOpen] = useState(false);
  const { deleteBonLivraison } = useBonLivraisonDelete();

  const handleDelete = async () => {
    try {
      await deleteBonLivraison.mutateAsync(bon.id);
      setOpen(false);
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (disabled) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white border-red-500"
        onClick={() => setOpen(true)}
        title="Supprimer"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le bon de livraison <strong>{bon.numero_bon}</strong> ?
            <br />
            Cette action est irréversible et supprimera également tous les articles associés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteBonLivraison.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteBonLivraison.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
