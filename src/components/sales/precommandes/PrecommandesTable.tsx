
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useConvertPrecommandeToSale } from '@/hooks/precommandes/useConvertPrecommandeToSale';
import EditPrecommandeDialog from './EditPrecommandeDialog';
import DeletePrecommandeDialog from './DeletePrecommandeDialog';
import PrecommandeFactureDialog from './PrecommandeFactureDialog';
import PrecommandesTableHeader from './PrecommandesTableHeader';
import PrecommandesTableRow from './PrecommandesTableRow';

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
      <div className="border rounded-lg">
        <Table>
          <PrecommandesTableHeader />
          <TableBody>
            {precommandes.map((precommande) => (
              <PrecommandesTableRow
                key={precommande.id}
                precommande={precommande}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <EditPrecommandeDialog
        precommande={editDialog}
        open={!!editDialog}
        onClose={() => setEditDialog(null)}
      />

      <DeletePrecommandeDialog
        precommande={deleteDialog}
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
      />

      <PrecommandeFactureDialog
        precommande={factureDialog}
        open={!!factureDialog}
        onClose={() => setFactureDialog(null)}
      />
    </>
  );
};

export default PrecommandesTable;
