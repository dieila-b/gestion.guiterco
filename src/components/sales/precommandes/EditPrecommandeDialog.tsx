
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useUpdatePrecommande } from '@/hooks/precommandes/useUpdatePrecommande';
import { useStockDisponibilite } from '@/hooks/precommandes/useStockDisponibilite';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import EditPrecommandeForm from './EditPrecommandeForm';

interface EditPrecommandeDialogProps {
  precommande: PrecommandeComplete | null;
  open: boolean;
  onClose: () => void;
}

const EditPrecommandeDialog = ({ precommande, open, onClose }: EditPrecommandeDialogProps) => {
  const updatePrecommande = useUpdatePrecommande();
  
  // Créer un mapping des stocks pour tous les articles de la précommande
  const stockQueries = precommande?.lignes_precommande?.map(ligne => ligne.article_id) || [];
  const stockDisponibilite: Record<string, { total: number }> = {};
  
  // Pour chaque article, récupérer son stock (simplifié ici)
  stockQueries.forEach(articleId => {
    const { data: stock } = useStockDisponibilite(articleId);
    if (stock) {
      stockDisponibilite[articleId] = stock;
    }
  });

  const handleSave = async (updates: any) => {
    if (!precommande) return;

    try {
      await updatePrecommande.mutateAsync({
        id: precommande.id,
        updates: {
          observations: updates.observations,
          date_livraison_prevue: updates.date_livraison_prevue || null,
          montant_ht: updates.montant_ht,
          tva: updates.tva,
          montant_ttc: updates.montant_ttc,
          // Les lignes seront mises à jour séparément si nécessaire
        }
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
                stockDisponibilite={stockDisponibilite}
              />
            )}
          </div>
        </DialogHeader>

        {precommande && (
          <div className="space-y-6">
            {/* Informations client */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Client</h3>
              <p>{precommande.client?.nom || 'Client non spécifié'}</p>
              {precommande.client?.email && (
                <p className="text-sm text-gray-600">{precommande.client.email}</p>
              )}
              {precommande.client?.telephone && (
                <p className="text-sm text-gray-600">{precommande.client.telephone}</p>
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
