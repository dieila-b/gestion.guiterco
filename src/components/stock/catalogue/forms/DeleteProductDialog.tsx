
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Article } from '@/hooks/useCatalogueOptimized';

interface DeleteProductDialogProps {
  article: Article;
}

export const DeleteProductDialog = ({ article }: DeleteProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      // Vérifier s'il y a du stock pour cet article
      const { data: stockData } = await supabase
        .from('stock_principal')
        .select('id')
        .eq('article_id', article.id)
        .limit(1);

      if (stockData && stockData.length > 0) {
        throw new Error('Impossible de supprimer cet article car il existe encore du stock.');
      }

      // Vérifier s'il y a des commandes pour cet article
      const { data: commandeData } = await supabase
        .from('articles_bon_commande')
        .select('id')
        .eq('article_id', article.id)
        .limit(1);

      if (commandeData && commandeData.length > 0) {
        throw new Error('Impossible de supprimer cet article car il est référencé dans des commandes.');
      }

      // Supprimer l'article
      const { error } = await supabase
        .from('catalogue')
        .delete()
        .eq('id', article.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      queryClient.invalidateQueries({ queryKey: ['catalogue_optimized'] });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le produit "{article.nom}" ?
            <br />
            Cette action est irréversible et supprimera définitivement ce produit du catalogue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteProductMutation.mutate()}
            disabled={deleteProductMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteProductMutation.isPending ? (
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
