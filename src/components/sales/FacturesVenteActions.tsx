
import React, { useState } from 'react';
import ActionButtons from './actions/ActionButtons';
import DeleteFactureDialog from './actions/DeleteFactureDialog';
import type { FactureVente } from '@/types/sales';

interface FacturesVenteActionsProps {
  facture: FactureVente;
}

const FacturesVenteActions = ({ facture }: FacturesVenteActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      <ActionButtons facture={facture} onDelete={handleDelete} />

      <DeleteFactureDialog
        facture={facture}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};

export default FacturesVenteActions;
