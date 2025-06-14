
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Printer, Ticket } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

interface FacturesVenteActionsProps {
  facture: FactureVente;
}

const FacturesVenteActions = ({ facture }: FacturesVenteActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
      setShowDeleteDialog(false);
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

  const handleEdit = () => {
    toast({
      title: "Modification",
      description: "Fonctionnalité de modification en cours de développement.",
    });
    console.log('Modifier facture:', facture.id);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handlePrint = () => {
    // Créer un contenu d'impression simple
    const printContent = `
      <html>
        <head>
          <title>Facture ${facture.numero_facture}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURE DE VENTE</h1>
            <h2>${facture.numero_facture}</h2>
          </div>
          <div class="info">
            <p><strong>Date:</strong> ${new Date(facture.date_facture).toLocaleDateString('fr-FR')}</p>
            <p><strong>Client:</strong> ${facture.client?.nom || 'Client non spécifié'}</p>
            <p><strong>Statut:</strong> ${facture.statut_paiement}</p>
          </div>
          <div class="total">
            <p>Total HT: ${facture.montant_ht.toFixed(2)} €</p>
            <p>TVA: ${facture.tva.toFixed(2)} €</p>
            <p>Total TTC: ${facture.montant_ttc.toFixed(2)} €</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleTicket = () => {
    // Créer un ticket de caisse simple
    const ticketContent = `
      <html>
        <head>
          <title>Ticket ${facture.numero_facture}</title>
          <style>
            body { font-family: monospace; width: 300px; margin: 0 auto; font-size: 12px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="center bold">
            TICKET DE CAISSE
          </div>
          <div class="line"></div>
          <div class="center">
            ${facture.numero_facture}
          </div>
          <div class="line"></div>
          <p>Date: ${new Date(facture.date_facture).toLocaleDateString('fr-FR')}</p>
          <p>Client: ${facture.client?.nom || 'Client'}</p>
          <div class="line"></div>
          <p class="bold">Total: ${facture.montant_ttc.toFixed(2)} €</p>
          <div class="line"></div>
          <div class="center">
            Merci de votre visite !
          </div>
        </body>
      </html>
    `;

    const ticketWindow = window.open('', '_blank');
    if (ticketWindow) {
      ticketWindow.document.write(ticketContent);
      ticketWindow.document.close();
      ticketWindow.print();
    }
  };

  const confirmDelete = () => {
    deleteFactureMutation.mutate(facture.id);
  };

  return (
    <>
      <div className="flex justify-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="h-8 w-8 p-0 hover:bg-orange-100"
          title="Modifier"
        >
          <Edit className="h-4 w-4 text-orange-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 hover:bg-red-100"
          title="Supprimer"
        >
          <Trash className="h-4 w-4 text-red-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrint}
          className="h-8 w-8 p-0 hover:bg-blue-100"
          title="Imprimer"
        >
          <Printer className="h-4 w-4 text-blue-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTicket}
          className="h-8 w-8 p-0 hover:bg-green-100"
          title="Ticket"
        >
          <Ticket className="h-4 w-4 text-green-600" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteFactureMutation.isPending}
            >
              {deleteFactureMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FacturesVenteActions;
