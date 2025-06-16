
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Printer, Ticket } from 'lucide-react';
import { printFacture, printTicket } from './printUtils';
import EditFactureDialog from './EditFactureDialog';
import type { FactureVente } from '@/types/sales';
import { calculatePaidAmount, getActualDeliveryStatus } from '../table/StatusUtils';

interface ActionButtonsProps {
  facture: FactureVente;
}

const ActionButtons = ({ facture }: ActionButtonsProps) => {
  const handlePrint = () => {
    printFacture(facture);
  };

  const handleTicket = () => {
    printTicket(facture);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete facture:', facture.id);
  };

  // Nouvelle règle suppression :
  // => Afficher le bouton supprimer UNIQUEMENT si aucun paiement ET aucune livraison effectuée
  const isDeletable =
    calculatePaidAmount(facture) === 0 && getActualDeliveryStatus(facture) === 'en_attente';

  // Facture = archivée si payée ET livrée
  const isArchived =
    calculatePaidAmount(facture) >= facture.montant_ttc &&
    getActualDeliveryStatus(facture) === 'livree';

  return (
    <div className="flex justify-center space-x-1">
      {/* Bouton Modifier désactivé si archivée */}
      {!isArchived && (
        <EditFactureDialog facture={facture} />
      )}
      {/* Bouton Supprimer affiché UNIQUEMENT si facture ni payée ni livrée */}
      {isDeletable && !isArchived && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 hover:bg-red-100"
          title="Supprimer"
        >
          <Trash className="h-4 w-4 text-red-600" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrint}
        className="h-8 w-8 p-0 hover:bg-blue-100"
        title="Imprimer"
      >
        <Printer className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTicket}
        className="h-8 w-8 p-0 hover:bg-green-100"
        title="Ticket"
      >
        <Ticket className="h-4 w-4 text-green-600" />
      </Button>
    </div>
  );
};

export default ActionButtons;
