
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

interface DeleteFactureDialogProps {
  facture: FactureVente;
  children?: React.ReactNode;
}

const DeleteFactureDialog = ({ facture, children }: DeleteFactureDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteFactureMutation = useMutation({
    mutationFn: async (factureId: string) => {
      const { error } = await supabase
        .from('factures_vente')
        .delete()
        .eq('id', factureId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      toast({
        title: "Facture supprimée",
        description: "La facture a été supprimée avec succès.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture.",
        variant: "destructive",
      });
      console.error('Error deleting facture:', error);
    }
  });

  const handleConfirmDelete = () => {
    deleteFactureMutation.mutate(facture.id);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la facture {facture.numero_facture} ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteFactureMutation.isPending}
          >
            {deleteFactureMutation.isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFactureDialog;
