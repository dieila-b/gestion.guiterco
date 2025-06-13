
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useFacturesAchat } from '@/hooks/useFacturesAchat';
import { toast } from '@/hooks/use-toast';

interface DeleteFactureAchatDialogProps {
  factureId: string;
  numeroFacture: string;
}

export const DeleteFactureAchatDialog = ({ factureId, numeroFacture }: DeleteFactureAchatDialogProps) => {
  const [open, setOpen] = useState(false);
  const { deleteFactureAchat } = useFacturesAchat();

  const handleDelete = async () => {
    try {
      await deleteFactureAchat.mutateAsync(factureId);
      setOpen(false);
      toast({
        title: "Facture d'achat supprimée",
        description: `La facture ${numeroFacture} a été supprimée avec succès.`,
      });
    } catch (error) {
      console.error('Error deleting facture achat:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture d'achat.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs bg-red-500 hover:bg-red-600 text-white border-red-500"
        >
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la facture d'achat</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la facture <strong>{numeroFacture}</strong> ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
            disabled={deleteFactureAchat.isPending}
          >
            {deleteFactureAchat.isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
