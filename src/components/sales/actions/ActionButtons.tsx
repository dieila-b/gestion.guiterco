
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash, FileText, CreditCard, Truck } from 'lucide-react';
import FacturePDFAction from './FacturePDFAction';
import type { FactureVente } from '@/types/sales';

interface ActionButtonsProps {
  facture: FactureVente;
}

const ActionButtons = ({ facture }: ActionButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* Bouton PDF direct */}
      <FacturePDFAction facture={facture} />
      
      {/* Menu d'actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            Voir détails
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            Gérer paiement
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Truck className="mr-2 h-4 w-4" />
            Gérer livraison
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ActionButtons;
