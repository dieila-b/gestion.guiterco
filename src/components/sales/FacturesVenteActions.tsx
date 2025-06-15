
import React from 'react';
import ActionButtons from './actions/ActionButtons';
import DeleteFactureDialog from './actions/DeleteFactureDialog';
import type { FactureVente } from '@/types/sales';

interface FacturesVenteActionsProps {
  facture: FactureVente;
}

const FacturesVenteActions = ({ facture }: FacturesVenteActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // On masque Edit/Supprimer si payée
  const hideEditDelete = facture.statut_paiement === 'payee';

  const handleEdit = () => {};
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      <ActionButtons
        facture={facture}
        onEdit={handleEdit}
        onDelete={handleDelete}
        hideEditDelete={hideEditDelete}
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
