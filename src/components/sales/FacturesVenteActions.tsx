
import React, { useState } from 'react';
import ActionButtons from './actions/ActionButtons';
import DeleteFactureDialog from './actions/DeleteFactureDialog';
import type { FactureVente } from '@/types/sales';
import { calculatePaidAmount, getActualDeliveryStatus } from './table/StatusUtils';

interface FacturesVenteActionsProps {
  facture: FactureVente;
}

const FacturesVenteActions = ({ facture }: FacturesVenteActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Facture = archivée si payée ET livrée
  const isArchived =
    calculatePaidAmount(facture) >= facture.montant_ttc &&
    getActualDeliveryStatus(facture) === 'livree';

  const handleEdit = () => {
    // Edit functionality placeholder
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      <ActionButtons
        facture={facture}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isArchived={isArchived}
      />

      <DeleteFactureDialog
        facture={facture}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};

export default FacturesVenteActions;
