
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useDeleteCategorie, type Categorie } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';

interface DeleteCategoryDialogProps {
  categorie: Categorie;
}

const DeleteCategoryDialog = ({ categorie }: DeleteCategoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const deleteCategorie = useDeleteCategorie();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteCategorie.mutateAsync(categorie.id);
      
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès."
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie.",
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
          <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la catégorie "{categorie.nom}" ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={deleteCategorie.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCategorie.isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCategoryDialog;
