
import React, { useState } from 'react';
import ActionButtons from './actions/ActionButtons';
import DeleteFactureDialog from './actions/DeleteFactureDialog';
import type { FactureVente } from '@/types/sales';

interface FacturesVenteActionsProps {
  facture: FactureVente;
}

const FacturesVenteActions = ({ facture }: FacturesVenteActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <ActionButtons facture={facture} />

      <DeleteFactureDialog
        facture={facture}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};

export default FacturesVenteActions;
