
import React, { useState } from 'react';
import { MoreHorizontal, Eye, Edit, Trash2, Printer, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { printFacture, printTicket } from './actions/printUtils';
import { PrintFactureVenteDialog } from './actions/PrintFactureVenteDialog';
import PaymentSection from './actions/PaymentSection';
import DeliverySection from './actions/DeliverySection';
import EditFactureDialog from './actions/EditFactureDialog';
import DeleteFactureDialog from './actions/DeleteFactureDialog';
import type { FactureVente } from '@/types/sales';

interface FacturesVenteActionsProps {
  facture: FactureVente;
}

const FacturesVenteActions = ({ facture }: FacturesVenteActionsProps) => {
  const [showPayment, setShowPayment] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      {/* Dialogue d'impression personnalisé */}
      <PrintFactureVenteDialog facture={facture} />
      
      {/* Section paiement */}
      <PaymentSection 
        facture={facture} 
        open={showPayment} 
        onOpenChange={setShowPayment} 
      />
      
      {/* Section livraison */}
      <DeliverySection 
        facture={facture} 
        open={showDelivery} 
        onOpenChange={setShowDelivery} 
      />

      {/* Menu des actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => console.log('Voir détails', facture.id)}>
            <Eye className="mr-2 h-4 w-4" />
            Voir détails
          </DropdownMenuItem>
          
          <EditFactureDialog facture={facture}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
          </EditFactureDialog>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowPayment(true)}>
            💳 Gérer paiement
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowDelivery(true)}>
            🚚 Gérer livraison
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => printFacture(facture)}>
            <Printer className="mr-2 h-4 w-4" />
            Impression rapide
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => printTicket(facture)}>
            <Receipt className="mr-2 h-4 w-4" />
            Ticket de caisse
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DeleteFactureDialog facture={facture}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DeleteFactureDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FacturesVenteActions;
