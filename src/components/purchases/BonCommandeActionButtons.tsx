
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Trash } from 'lucide-react';
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
        <PrintBonCommandeDialog bon={bon} />
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center">
        <PrintBonCommandeDialog bon={bon} />
      </div>
    );
  }
};
