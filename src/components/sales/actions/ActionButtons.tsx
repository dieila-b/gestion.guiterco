
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Printer, Ticket, Edit } from 'lucide-react';
import { printFacture, printTicket } from './print';
import EditFactureDialog from './EditFactureDialog';
import type { FactureVente } from '@/types/sales';
import { calculatePaidAmount, getActualDeliveryStatus } from '../table/StatusUtils';

interface ActionButtonsProps {
  facture: FactureVente;
  onDelete?: () => void;
}

const ActionButtons = ({ facture, onDelete }: ActionButtonsProps) => {
  const handlePrint = () => {
    printFacture(facture);
  };

  const handleTicket = () => {
    printTicket(facture);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      // TODO: Implement delete functionality
      console.log('Delete facture:', facture.id);
    }
  };

  // Règles de suppression : UNIQUEMENT si aucun paiement ET aucune livraison effectuée
  const isDeletable =
    calculatePaidAmount(facture) === 0 && getActualDeliveryStatus(facture) === 'en_attente';

  // Facture = archivée si payée ET livrée
  const isArchived =
    calculatePaidAmount(facture) >= facture.montant_ttc &&
    getActualDeliveryStatus(facture) === 'livree';

  return (
    <div className="flex justify-center space-x-1">
      {/* Bouton Modifier (jaune) - désactivé si archivée */}
      {!isArchived && (
        <EditFactureDialog facture={facture}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-yellow-100"
            title="Modifier"
          >
            <Edit className="h-4 w-4 text-yellow-600" />
          </Button>
        </EditFactureDialog>
      )}

      {/* Bouton Supprimer (rouge) - affiché UNIQUEMENT si facture ni payée ni livrée */}
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

      {/* Bouton Imprimer facture (gris clair) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrint}
        className="h-8 w-8 p-0 hover:bg-gray-100"
        title="Imprimer facture"
      >
        <Printer className="h-4 w-4 text-gray-600" />
      </Button>

      {/* Bouton Ticket de caisse (vert) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTicket}
        className="h-8 w-8 p-0 hover:bg-green-100"
        title="Ticket de caisse"
      >
        <Ticket className="h-4 w-4 text-green-600" />
      </Button>
    </div>
  );
};

export default ActionButtons;
