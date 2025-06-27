
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Edit, FileText, Trash2, CreditCard, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date-utils';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useStockDisponibilite } from '@/hooks/precommandes/useStockDisponibilite';
import PrecommandeDetails from './PrecommandeDetails';
import EditPrecommandeDialog from './EditPrecommandeDialog';
import DeletePrecommandeDialog from './DeletePrecommandeDialog';
import PrecommandeFactureDialog from './PrecommandeFactureDialog';
import PaymentDialog from './PaymentDialog';
import PrecommandesStatusBadge from './PrecommandesStatusBadge';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import { PrecommandesPaymentInfo } from './PrecommandesPaymentInfo';

interface PrecommandesTableRowRestructuredProps {
  precommande: PrecommandeComplete;
}

const PrecommandesTableRowRestructured = ({ precommande }: PrecommandesTableRowRestructuredProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showFacture, setShowFacture] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Calculer les totaux de quantité
  const totalQuantite = precommande.lignes_precommande?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0;
  const totalQuantiteLivree = precommande.lignes_precommande?.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0) || 0;

  // Calculer les informations de paiement
  const montantTTC = precommande.montant_ttc || 0;
  const acompteVerse = precommande.acompte_verse || 0;
  const resteAPayer = montantTTC - acompteVerse;

  // Obtenir le statut de paiement
  const getStatutPaiement = () => {
    if (acompteVerse === 0) return { label: 'Non payé', color: 'bg-red-100 text-red-800' };
    if (acompteVerse >= montantTTC) return { label: 'Payé', color: 'bg-green-100 text-green-800' };
    return { label: 'Partiel', color: 'bg-orange-100 text-orange-800' };
  };

  // Obtenir le statut de livraison
  const getStatutLivraison = () => {
    if (totalQuantiteLivree === 0) return 'en_attente';
    if (totalQuantiteLivree < totalQuantite) return 'partiellement_livree';
    return 'livree';
  };

  const statutPaiement = getStatutPaiement();
  const statutLivraison = getStatutLivraison();

  // Résumé des produits
  const getProduitsResume = () => {
    if (!precommande.lignes_precommande || precommande.lignes_precommande.length === 0) {
      return 'Aucun produit';
    }
    
    if (precommande.lignes_precommande.length === 1) {
      return precommande.lignes_precommande[0].article?.nom || 'Produit inconnu';
    }
    
    return `${precommande.lignes_precommande.length} produits`;
  };

  return (
    <TooltipProvider>
      <TableRow className="hover:bg-gray-50">
        {/* N° Précommande */}
        <TableCell className="font-medium">
          <div className="space-y-1">
            <div className="text-sm font-semibold">{precommande.numero_precommande}</div>
            {precommande.notifications && precommande.notifications.length > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {precommande.notifications.length} notification(s)
              </Badge>
            )}
          </div>
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

        {/* Statut */}
        <TableCell>
          <div className="space-y-2">
            <PrecommandesStatusBadge statut={precommande.statut} />
            <DeliveryStatusBadge 
              lignes={precommande.lignes_precommande || []}
              statut={statutLivraison}
            />
            <Badge className={`text-xs ${statutPaiement.color}`}>
              {statutPaiement.label}
            </Badge>
          </div>
        </TableCell>

        {/* Montant avec détails */}
        <TableCell className="text-right">
          <div className="space-y-1">
            <div className="font-semibold text-sm">{formatCurrency(montantTTC)}</div>
            {acompteVerse > 0 && (
              <div className="text-xs text-green-600">
                Acompte: {formatCurrency(acompteVerse)}
              </div>
            )}
            {resteAPayer > 0 && (
              <div className="text-xs text-blue-600 font-medium">
                Reste: {formatCurrency(resteAPayer)}
              </div>
            )}
            <div className="text-xs text-gray-500">
              Qté: {totalQuantiteLivree}/{totalQuantite}
            </div>
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

            {resteAPayer > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPayment(true)}
                    className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
                  >
                    <CreditCard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Effectuer un paiement</p>
                </TooltipContent>
              </Tooltip>
            )}

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

      <PaymentDialog
        precommande={precommande}
        open={showPayment}
        onClose={() => setShowPayment(false)}
        type="acompte"
      />
    </TooltipProvider>
  );
};

export default PrecommandesTableRowRestructured;
