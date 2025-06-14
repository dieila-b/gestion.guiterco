
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Printer, Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { printFacture, printTicket } from './printUtils';
import type { FactureVente } from '@/types/sales';

interface ActionButtonsProps {
  facture: FactureVente;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionButtons = ({ facture, onEdit, onDelete }: ActionButtonsProps) => {
  const { toast } = useToast();

  const handleEdit = () => {
    toast({
      title: "Modification",
      description: "Fonctionnalité de modification en cours de développement.",
    });
    console.log('Modifier facture:', facture.id);
    onEdit();
  };

  const handlePrint = () => {
    printFacture(facture);
  };

  const handleTicket = () => {
    printTicket(facture);
  };

  return (
    <div className="flex justify-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEdit}
        className="h-8 w-8 p-0 hover:bg-orange-100"
        title="Modifier"
      >
        <Edit className="h-4 w-4 text-orange-600" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 hover:bg-red-100"
        title="Supprimer"
      >
        <Trash className="h-4 w-4 text-red-600" />
      </Button>
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
