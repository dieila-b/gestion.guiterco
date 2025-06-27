
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, FileText, Truck, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date-utils';
import type { PrecommandeComplete } from '@/types/precommandes';
import PrecommandesStatusBadge from './PrecommandesStatusBadge';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import PrecommandeDetails from './PrecommandeDetails';
import EditPrecommandeDialog from './EditPrecommandeDialog';
import DeletePrecommandeDialog from './DeletePrecommandeDialog';
import PrecommandeFactureDialog from './PrecommandeFactureDialog';
import PaymentDialog from './PaymentDialog';
import PrecommandeNotificationBadge from './PrecommandeNotificationBadge';

interface PrecommandesTableRowProps {
  precommande: PrecommandeComplete;
}

const PrecommandesTableRow = ({ precommande }: PrecommandesTableRowProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showFacture, setShowFacture] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const calculateDeliveryStatus = () => {
    if (!precommande.lignes_precommande || precommande.lignes_precommande.length === 0) {
      return 'en_attente';
    }

    const totalQuantite = precommande.lignes_precommande.reduce((sum, ligne) => sum + ligne.quantite, 0);
    const totalLivree = precommande.lignes_precommande.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);

    if (totalLivree === totalQuantite && totalQuantite > 0) {
      return 'livree';
    } else if (totalLivree > 0) {
      return 'partiellement_livree';
    } else {
      return 'en_attente';
    }
  };

  const deliveryStatus = calculateDeliveryStatus();
  const resteAPayer = (precommande.montant_ttc || 0) - (precommande.acompte_verse || 0);

  return (
    <>
      <TableRow className="hover:bg-gray-50">
        <TableCell className="font-medium">
          <div className="space-y-1">
            <div>{precommande.numero_precommande}</div>
            {precommande.notifications && precommande.notifications.length > 0 && (
              <PrecommandeNotificationBadge notifications={precommande.notifications} />
            )}
          </div>
        </TableCell>
        <TableCell>{formatDate(precommande.date_precommande)}</TableCell>
        <TableCell>
          <div className="font-medium">{precommande.client?.nom}</div>
          {precommande.client?.email && (
            <div className="text-sm text-gray-500">{precommande.client.email}</div>
          )}
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <PrecommandesStatusBadge statut={precommande.statut} />
            <DeliveryStatusBadge 
              lignes={precommande.lignes_precommande || []}
              statut={deliveryStatus}
            />
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="space-y-1">
            <div className="font-medium">{formatCurrency(precommande.montant_ttc)}</div>
            {(precommande.acompte_verse || 0) > 0 && (
              <div className="text-sm text-green-600">
                Acompte: {formatCurrency(precommande.acompte_verse || 0)}
              </div>
            )}
            {resteAPayer > 0 && (
              <div className="text-sm text-blue-600">
                Reste: {formatCurrency(resteAPayer)}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(true)}
              title="Voir les détails"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEdit(true)}
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFacture(true)}
              title="Voir la facture"
            >
              <FileText className="h-4 w-4" />
            </Button>
            {resteAPayer > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPayment(true)}
                title="Effectuer un paiement"
              >
                <CreditCard className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDelete(true)}
              title="Supprimer"
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

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

      <PaymentDialog
        precommande={precommande}
        open={showPayment}
        onClose={() => setShowPayment(false)}
        type="acompte"
      />
    </>
  );
};

export default PrecommandesTableRow;
