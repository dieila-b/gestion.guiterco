
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Printer, Ticket, Pencil } from 'lucide-react';
import { printFacture, printTicket } from './printUtils';
import EditFactureDialog from './EditFactureDialog';
import type { FactureVente } from '@/types/sales';

interface ActionButtonsProps {
  facture: FactureVente;
  onEdit: () => void;
  onDelete: () => void;
  isArchived?: boolean;
}

const ActionButtons = ({ facture, onEdit, onDelete, isArchived }: ActionButtonsProps) => {
  const handlePrint = () => {
    printFacture(facture);
  };

  const handleTicket = () => {
    printTicket(facture);
  };

  return (
    <div className="flex justify-center space-x-1">
      {/* Bouton Modifier désactivé si archivée */}
      {!isArchived && (
        <EditFactureDialog facture={facture} />
      )}
      {/* Bouton Supprimer désactivé si archivée */}
      {!isArchived && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
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
