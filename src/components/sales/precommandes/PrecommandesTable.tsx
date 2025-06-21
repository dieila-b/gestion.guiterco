
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useConvertPrecommandeToSale } from '@/hooks/precommandes/useConvertPrecommandeToSale';
import PaymentDialog from './PaymentDialog';
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

  const handleConvertirEnVente = (precommande: PrecommandeComplete) => {
    convertToSale.mutate(precommande.id);
  };

  const handleEditer = (precommande: PrecommandeComplete) => {
    // TODO: Ouvrir le dialogue d'édition de la précommande
    console.log('Éditer précommande:', precommande.numero_precommande);
  };

  const handleFacture = (precommande: PrecommandeComplete) => {
    // TODO: Générer et afficher la facture de précommande
    console.log('Générer facture pour:', precommande.numero_precommande);
  };

  const handleSupprimer = (precommande: PrecommandeComplete) => {
    // TODO: Confirmer et supprimer la précommande
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la précommande ${precommande.numero_precommande} ?`)) {
      console.log('Supprimer précommande:', precommande.numero_precommande);
    }
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
                onFacture={handleFacture}
                onSupprimer={handleSupprimer}
                onFinaliserPaiement={handleFinaliserPaiement}
                isConverting={convertToSale.isPending}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {paymentDialog && (
        <PaymentDialog
          precommande={paymentDialog.precommande}
          type={paymentDialog.type}
          open={true}
          onClose={() => setPaymentDialog(null)}
        />
      )}
    </>
  );
};

export default PrecommandesTable;
