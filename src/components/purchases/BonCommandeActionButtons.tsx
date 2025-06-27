
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Trash, Edit, FileText } from 'lucide-react';
import { EditBonCommandeDialog } from './EditBonCommandeDialog';
import { PrintBonCommandeDialog } from './PrintBonCommandeDialog';

interface ActionButtonsProps {
  bon: any;
  onApprove: (id: string, bon: any) => void;
  onDelete: (id: string) => void;
}

export const BonCommandeActionButtons = ({ bon, onApprove, onDelete }: ActionButtonsProps) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  if (bon.statut === 'en_cours') {
    return (
      <div className="flex items-center justify-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setShowEdit(true)}
          title="Modifier"
        >
          <Edit className="h-4 w-4" />
        </Button>
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
          className="h-8 w-8 p-0"
          onClick={() => setShowPrint(true)}
          title="Imprimer"
        >
          <FileText className="h-4 w-4" />
        </Button>

        <EditBonCommandeDialog 
          bon={bon}
          open={showEdit}
          onClose={() => setShowEdit(false)}
          onSuccess={() => setShowEdit(false)}
        />

        <PrintBonCommandeDialog 
          bon={bon}
          open={showPrint}
          onClose={() => setShowPrint(false)}
        />
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setShowPrint(true)}
          title="Imprimer"
        >
          <FileText className="h-4 w-4" />
        </Button>

        <PrintBonCommandeDialog 
          bon={bon}
          open={showPrint}
          onClose={() => setShowPrint(false)}
        />
      </div>
    );
  }
};
