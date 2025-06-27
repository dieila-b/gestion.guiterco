
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Check,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/currency';
import type { BonCommande } from '@/types/purchases';
import { useBonLivraisonValidation } from '@/hooks/purchases/useBonLivraisonValidation';
import PrecommandeAlertDialog from './PrecommandeAlertDialog';

interface BonCommandeTableRowProps {
  bonCommande: BonCommande;
  onView: (bon: BonCommande) => void;
  onDelete: (bon: BonCommande) => void;
  articlesCount?: number;
}

const BonCommandeTableRow = ({ 
  bonCommande, 
  onView, 
  onDelete, 
  articlesCount = 0 
}: BonCommandeTableRowProps) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showApproval, setShowApproval] = useState(false);

  const {
    alertInfo,
    showAlert,
    checkPrecommandesBeforeValidation,
    confirmValidation,
    cancelValidation
  } = useBonLivraisonValidation();

  const getStatutBadge = (statut: string) => {
    const variants = {
      'en_cours': 'secondary',
      'approuve': 'default',
      'livre': 'outline',
      'receptionne': 'outline',
      'annule': 'destructive'
    } as const;

    const labels = {
      'en_cours': 'En cours',
      'approuve': 'Approuvé',
      'livre': 'Livré',
      'receptionne': 'Réceptionné',
      'annule': 'Annulé'
    };

    return (
      <Badge variant={variants[statut as keyof typeof variants] || 'secondary'}>
        {labels[statut as keyof typeof labels] || statut}
      </Badge>
    );
  };

  const handleApprovalClick = () => {
    // Simuler une vérification des précommandes
    checkPrecommandesBeforeValidation('article-id-example', () => {
      setShowApproval(true);
    });
  };

  return (
    <>
      <TableRow className="hover:bg-gray-50">
        <TableCell className="font-medium text-sm">
          {bonCommande.numero_bon}
        </TableCell>
        <TableCell className="text-sm">
          {formatDate(bonCommande.date_commande)}
        </TableCell>
        <TableCell className="text-sm">
          <div className="max-w-[150px] truncate">
            {bonCommande.fournisseur}
          </div>
        </TableCell>
        <TableCell className="text-center text-sm">
          <Badge variant="outline" className="text-xs">
            {articlesCount} article{articlesCount > 1 ? 's' : ''}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          {getStatutBadge(bonCommande.statut)}
        </TableCell>
        <TableCell className="text-right font-medium text-sm">
          {formatCurrency(bonCommande.montant_total)}
        </TableCell>
        <TableCell className="text-center">
          <div className="flex space-x-1 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(bonCommande)}
              title="Voir les détails"
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {bonCommande.statut === 'en_cours' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEdit(true)}
                title="Modifier"
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrint(true)}
              title="Imprimer"
              className="h-8 w-8 p-0"
            >
              <FileText className="h-4 w-4" />
            </Button>
            
            {bonCommande.statut === 'en_cours' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleApprovalClick}
                title="Approuver et créer bon de livraison"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            
            {bonCommande.statut === 'en_cours' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(bonCommande)}
                title="Supprimer"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      <PrecommandeAlertDialog
        open={showAlert}
        onClose={cancelValidation}
        alertInfo={alertInfo}
        onConfirm={confirmValidation}
      />
    </>
  );
};

export default BonCommandeTableRow;
