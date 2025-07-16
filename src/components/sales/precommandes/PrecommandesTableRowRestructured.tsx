
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Edit, FileText, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date-utils';
import type { PrecommandeComplete } from '@/types/precommandes';
import PrecommandeDetails from './PrecommandeDetails';
import EditPrecommandeDialog from './EditPrecommandeDialog';
import DeletePrecommandeDialog from './DeletePrecommandeDialog';
import PrecommandeFactureDialog from './PrecommandeFactureDialog';
import PaymentStatusBadge from './PaymentStatusBadge';
import StockStatusBadge from './StockStatusBadge';
import DeliveryStatusBadge from './DeliveryStatusBadge';

interface PrecommandesTableRowRestructuredProps {
  precommande: PrecommandeComplete;
}

const PrecommandesTableRowRestructured = ({ precommande }: PrecommandesTableRowRestructuredProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showFacture, setShowFacture] = useState(false);

  // Condition pour masquer les actions Modifier et Supprimer
  const isCompletedOrder = precommande.statut === 'livree' && precommande.payment_status === 'paye';

  return (
    <TooltipProvider>
      <TableRow className="hover:bg-gray-50">
        {/* N° Précommande */}
        <TableCell className="font-medium">
          <div className="text-sm font-semibold">{precommande.numero_precommande}</div>
        </TableCell>

        {/* Date */}
        <TableCell>
          <div className="text-sm">{formatDate(precommande.date_precommande)}</div>
          {precommande.date_livraison_prevue && (
            <div className="text-xs text-gray-500">
              Livraison: {formatDate(precommande.date_livraison_prevue)}
            </div>
          )}
        </TableCell>

        {/* Client */}
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium text-sm">{precommande.client?.nom}</div>
            {precommande.client?.email && (
              <div className="text-xs text-gray-500">{precommande.client.email}</div>
            )}
          </div>
        </TableCell>

        {/* Disponibilité Stock */}
        <TableCell>
          <div className="space-y-1">
            <StockStatusBadge status={precommande.stock_status} />
            {precommande.lignes_precommande && precommande.lignes_precommande.length > 0 && (
              <div className="text-xs text-gray-600">
                {(() => {
                  const totalCommande = precommande.lignes_precommande.reduce((sum, ligne) => sum + ligne.quantite, 0);
                  const totalStockDisponible = precommande.lignes_precommande.reduce((sum, ligne) => 
                    sum + (ligne.stock_disponible?.total || 0), 0);
                  
                  if (totalStockDisponible >= totalCommande) {
                    return `Disponible : ${totalStockDisponible}`;
                  } else if (totalStockDisponible === 0) {
                    return "En attente";
                  } else {
                    return `Partiel : ${totalStockDisponible}/${totalCommande}`;
                  }
                })()}
              </div>
            )}
          </div>
        </TableCell>

        {/* Statut de livraison */}
        <TableCell>
          <DeliveryStatusBadge status={precommande.statut} />
        </TableCell>

        {/* Statut de paiement */}
        <TableCell>
          <PaymentStatusBadge status={precommande.payment_status} />
        </TableCell>

        {/* Montant TTC */}
        <TableCell className="text-right">
          <div className="font-semibold text-sm">{formatCurrency(precommande.montant_ttc)}</div>
        </TableCell>

        {/* Montant payé */}
        <TableCell className="text-right">
          <div className="text-sm text-green-600 font-medium">
            {formatCurrency(precommande.amount_paid)}
          </div>
        </TableCell>

        {/* Reste à payer */}
        <TableCell className="text-right">
          <div className="text-sm text-blue-600 font-medium">
            {formatCurrency(precommande.amount_due)}
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <div className="flex items-center justify-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(true)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voir les détails</p>
              </TooltipContent>
            </Tooltip>

            {/* Bouton Modifier : masqué si livré ET payé */}
            {!isCompletedOrder && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEdit(true)}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Modifier</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFacture(true)}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voir la facture</p>
              </TooltipContent>
            </Tooltip>

            {/* Bouton Supprimer : masqué si livré ET payé */}
            {!isCompletedOrder && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDelete(true)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Supprimer</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Dialogs */}
      <PrecommandeDetails
        precommandeId={precommande.id}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />

      <EditPrecommandeDialog
        precommande={precommande}
        open={showEdit}
        onClose={() => setShowEdit(false)}
      />

      <DeletePrecommandeDialog
        precommande={precommande}
        open={showDelete}
        onClose={() => setShowDelete(false)}
      />

      <PrecommandeFactureDialog
        precommande={precommande}
        open={showFacture}
        onClose={() => setShowFacture(false)}
      />
    </TooltipProvider>
  );
};

export default PrecommandesTableRowRestructured;
