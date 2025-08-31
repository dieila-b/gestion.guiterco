
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useConvertPrecommandeToSale } from '@/hooks/precommandes/useConvertPrecommandeToSale';
import EditPrecommandeDialog from './EditPrecommandeDialog';
import DeletePrecommandeDialog from './DeletePrecommandeDialog';
import PrecommandeFactureDialog from './PrecommandeFactureDialog';
import PrecommandesTableHeader from './PrecommandesTableHeader';
import PrecommandesTableRowRestructured from './PrecommandesTableRowRestructured';

interface PrecommandesTableProps {
  precommandes: PrecommandeComplete[];
}

const PrecommandesTable = ({ precommandes }: PrecommandesTableProps) => {
  const convertToSale = useConvertPrecommandeToSale();
  
  const [editDialog, setEditDialog] = useState<PrecommandeComplete | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<PrecommandeComplete | null>(null);
  const [factureDialog, setFactureDialog] = useState<PrecommandeComplete | null>(null);

  const handleConvertirEnVente = (precommande: PrecommandeComplete) => {
    convertToSale.mutate(precommande.id);
  };

  const handleEditer = (precommande: PrecommandeComplete) => {
    setEditDialog(precommande);
  };

  const handleFacture = (precommande: PrecommandeComplete) => {
    setFactureDialog(precommande);
  };

  const handleSupprimer = (precommande: PrecommandeComplete) => {
    setDeleteDialog(precommande);
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <PrecommandesTableHeader />
          <TableBody>
            {precommandes.map((precommande) => (
              <PrecommandesTableRowRestructured
                key={precommande.id}
                precommande={precommande}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs globaux (au cas où certains composants en auraient besoin) */}
      {editDialog && (
        <EditPrecommandeDialog
          precommande={editDialog}
          open={!!editDialog}
          onClose={() => setEditDialog(null)}
        />
      )}

      {deleteDialog && (
        <DeletePrecommandeDialog
          precommande={deleteDialog}
          open={!!deleteDialog}
          onClose={() => setDeleteDialog(null)}
        />
      )}

      {factureDialog && (
        <PrecommandeFactureDialog
          precommande={factureDialog}
          open={!!factureDialog}
          onClose={() => setFactureDialog(null)}
        />
      )}
    </>
  );
};

export default PrecommandesTable;
