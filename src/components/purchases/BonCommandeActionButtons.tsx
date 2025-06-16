
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Trash, Printer } from 'lucide-react';
import { EditBonCommandeDialog } from './EditBonCommandeDialog';
import { PrintBonCommandeDialog } from './PrintBonCommandeDialog';

interface ActionButtonsProps {
  bon: any;
  onApprove: (id: string, bon: any) => void;
  onDelete: (id: string) => void;
}

export const BonCommandeActionButtons = ({ bon, onApprove, onDelete }: ActionButtonsProps) => {
  if (bon.statut === 'en_cours') {
    return (
      <div className="flex items-center justify-center space-x-1">
        <EditBonCommandeDialog bon={bon} />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
          onClick={() => onApprove(bon.id, bon)}
          title="Approuver"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          onClick={() => onDelete(bon.id)}
          title="Supprimer"
        >
          <Trash className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          title="Imprimer"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          title="Imprimer"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    );
  }
};
