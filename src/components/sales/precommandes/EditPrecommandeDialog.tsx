
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useUpdatePrecommande } from '@/hooks/precommandes/useUpdatePrecommande';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import EditPrecommandeForm from './EditPrecommandeForm';

interface EditPrecommandeDialogProps {
  precommande: PrecommandeComplete | null;
  open: boolean;
  onClose: () => void;
}

const EditPrecommandeDialog = ({ precommande, open, onClose }: EditPrecommandeDialogProps) => {
  const updatePrecommande = useUpdatePrecommande();

  const handleSave = async (updates: any, lignes?: any[]) => {
    if (!precommande) return;

    try {
      console.log('Sauvegarde précommande avec données:', { updates, lignes });
      
      await updatePrecommande.mutateAsync({
        id: precommande.id,
        updates: {
          observations: updates.observations,
          date_livraison_prevue: updates.date_livraison_prevue || null,
          montant_ht: updates.montant_ht,
          tva: updates.tva,
          montant_ttc: updates.montant_ttc,
          acompte_verse: updates.acompte_verse,
          reste_a_payer: updates.reste_a_payer,
          statut: updates.statut
        },
        lignes_precommande: lignes
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Éditer la précommande {precommande?.numero_precommande}
            </DialogTitle>
            {precommande && (
              <DeliveryStatusBadge 
                lignes={precommande.lignes_precommande || []}
                statut={precommande.statut}
              />
            )}
          </div>
        </DialogHeader>

        {precommande && (
          <div className="space-y-6">
            {/* Informations client */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">👤 Informations client</h3>
              <p className="font-medium">{precommande.client?.nom || 'Client non spécifié'}</p>
              {precommande.client?.email && (
                <p className="text-sm text-gray-600">📧 {precommande.client.email}</p>
              )}
              {precommande.client?.telephone && (
                <p className="text-sm text-gray-600">📞 {precommande.client.telephone}</p>
              )}
            </div>

            {/* Formulaire d'édition */}
            <EditPrecommandeForm
              precommande={precommande}
              onSave={handleSave}
              onCancel={onClose}
              isLoading={updatePrecommande.isPending}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPrecommandeDialog;
