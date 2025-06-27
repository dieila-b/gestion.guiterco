
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
import { formatCurrency } from '@/lib/currency';
import type { BonCommande } from '@/types/purchases';

interface DeleteBonCommandeDialogProps {
  bonCommande: BonCommande;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteBonCommandeDialog = ({ 
  bonCommande, 
  open, 
  onClose, 
  onConfirm 
}: DeleteBonCommandeDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le bon de commande</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Êtes-vous sûr de vouloir supprimer le bon de commande <strong>{bonCommande.numero_bon}</strong> ?
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div><strong>Fournisseur:</strong> {bonCommande.fournisseur}</div>
              <div><strong>Montant:</strong> {formatCurrency(bonCommande.montant_total)}</div>
              <div><strong>Statut:</strong> {bonCommande.statut}</div>
            </div>
            <p className="text-red-600 font-medium">
              Cette action est irréversible. Tous les articles liés seront également supprimés.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
