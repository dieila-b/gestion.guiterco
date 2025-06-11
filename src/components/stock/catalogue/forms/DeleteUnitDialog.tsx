
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useDeleteUnite, type Unite } from '@/hooks/useUnites';
import { useToast } from '@/hooks/use-toast';

interface DeleteUnitDialogProps {
  unite: Unite;
}

const DeleteUnitDialog = ({ unite }: DeleteUnitDialogProps) => {
  const [open, setOpen] = useState(false);
  const deleteUnite = useDeleteUnite();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteUnite.mutateAsync(unite.id);
      
      toast({
        title: "Unité supprimée",
        description: "L'unité de mesure a été supprimée avec succès."
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'unité:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'unité de mesure.",
        variant: "destructive"
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'unité</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'unité "{unite.nom}" ({unite.symbole}) ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={deleteUnite.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteUnite.isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUnitDialog;
