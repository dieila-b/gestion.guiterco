
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useConvertPrecommandeToSale } from '@/hooks/precommandes/useConvertPrecommandeToSale';
import PaymentDialog from './PaymentDialog';
import EditPrecommandeDialog from './EditPrecommandeDialog';
import EditLignesPrecommandeDialog from './EditLignesPrecommandeDialog';
import DeletePrecommandeDialog from './DeletePrecommandeDialog';
import PrecommandeFactureDialog from './PrecommandeFactureDialog';
import PrecommandesTableHeader from './PrecommandesTableHeader';
import PrecommandesTableRow from './PrecommandesTableRow';

interface PrecommandesTableProps {
  precommandes: PrecommandeComplete[];
}

const PrecommandesTable = ({ precommandes }: PrecommandesTableProps) => {
  const convertToSale = useConvertPrecommandeToSale();
  const [paymentDialog, setPaymentDialog] = useState<{
    precommande: PrecommandeComplete;
    type: 'acompte' | 'solde';
  } | null>(null);
  
  const [editDialog, setEditDialog] = useState<PrecommandeComplete | null>(null);
  const [editArticlesDialog, setEditArticlesDialog] = useState<PrecommandeComplete | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<PrecommandeComplete | null>(null);
  const [factureDialog, setFactureDialog] = useState<PrecommandeComplete | null>(null);

  const handleConvertirEnVente = (precommande: PrecommandeComplete) => {
    convertToSale.mutate(precommande.id);
  };

  const handleEditer = (precommande: PrecommandeComplete) => {
    setEditDialog(precommande);
  };

  const handleEditerArticles = (precommande: PrecommandeComplete) => {
    setEditArticlesDialog(precommande);
  };

  const handleFacture = (precommande: PrecommandeComplete) => {
    setFactureDialog(precommande);
  };

  const handleSupprimer = (precommande: PrecommandeComplete) => {
    setDeleteDialog(precommande);
  };

  const handleFinaliserPaiement = (precommande: PrecommandeComplete) => {
    setPaymentDialog({ precommande, type: 'solde' });
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
                onConvertirEnVente={handleConvertirEnVente}
                onEditer={handleEditer}
                onEditerArticles={handleEditerArticles}
                onFacture={handleFacture}
                onSupprimer={handleSupprimer}
                onFinaliserPaiement={handleFinaliserPaiement}
                isConverting={convertToSale.isPending}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {paymentDialog && (
        <PaymentDialog
          precommande={paymentDialog.precommande}
          type={paymentDialog.type}
          open={true}
          onClose={() => setPaymentDialog(null)}
        />
      )}

      <EditPrecommandeDialog
        precommande={editDialog}
        open={!!editDialog}
        onClose={() => setEditDialog(null)}
      />

      <EditLignesPrecommandeDialog
        precommande={editArticlesDialog}
        open={!!editArticlesDialog}
        onClose={() => setEditArticlesDialog(null)}
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
