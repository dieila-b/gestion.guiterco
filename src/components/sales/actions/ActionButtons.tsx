
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Check, Trash, Printer } from 'lucide-react';
import type { FactureVente } from '@/types/sales';

interface ActionButtonsProps {
  facture: FactureVente;
  onDelete?: () => void;
}

const ActionButtons = ({ facture, onDelete }: ActionButtonsProps) => {
  const handleEdit = () => {
    console.log('Édition de la facture:', facture.numero_facture);
    // TODO: Ouvrir le dialog d'édition
  };

  const handleValidate = () => {
    console.log('Validation de la facture:', facture.numero_facture);
    // TODO: Valider la facture selon le statut actuel
  };

  const handleDelete = () => {
    console.log('Suppression de la facture:', facture.numero_facture);
    onDelete?.();
  };

  const handlePrint = () => {
    console.log('Impression de la facture:', facture.numero_facture);
    // TODO: Imprimer la facture (PDF ou ticket)
  };

  return (
    <div className="flex items-center gap-1">
      {/* Bouton Éditer (jaune) */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
        onClick={handleEdit}
        title="Éditer"
      >
        <Edit className="h-4 w-4" />
      </Button>

      {/* Bouton Valider (vert) */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
        onClick={handleValidate}
        title="Valider"
      >
        <Check className="h-4 w-4" />
      </Button>

      {/* Bouton Supprimer (rouge) */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        onClick={handleDelete}
        title="Supprimer"
      >
        <Trash className="h-4 w-4" />
      </Button>

      {/* Bouton Imprimer (gris clair) */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        onClick={handlePrint}
        title="Imprimer"
      >
        <Printer className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ActionButtons;
