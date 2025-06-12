
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Check, Trash, Printer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ActionButtonsProps {
  bon: any;
  onApprove: (id: string, bon: any) => void;
  onDelete: (id: string) => void;
}

export const BonCommandeActionButtons = ({ bon, onApprove, onDelete }: ActionButtonsProps) => {
  const handleEdit = (id: string) => {
    toast({
      title: "Édition",
      description: "Fonctionnalité d'édition en cours de développement.",
      variant: "default",
    });
  };

  const handlePrint = (id: string) => {
    toast({
      title: "Impression",
      description: "Fonctionnalité d'impression en cours de développement.",
      variant: "default",
    });
  };

  if (bon.statut === 'en_cours') {
    return (
      <div className="flex items-center justify-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
          onClick={() => handleEdit(bon.id)}
          title="Éditer"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-green-400 hover:bg-green-500/20 hover:text-green-300"
          onClick={() => onApprove(bon.id, bon)}
          title="Approuver"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
          onClick={() => onDelete(bon.id)}
          title="Supprimer"
        >
          <Trash className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-500/20 hover:text-gray-300"
          onClick={() => handlePrint(bon.id)}
          title="Imprimer"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-500/20 hover:text-gray-300"
          onClick={() => handlePrint(bon.id)}
          title="Imprimer"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    );
  }
};
