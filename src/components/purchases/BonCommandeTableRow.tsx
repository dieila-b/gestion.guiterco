import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Truck, 
  Check,
  AlertTriangle
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/currency';
import type { BonCommande } from '@/types/purchases';
import EditBonCommandeDialog from './EditBonCommandeDialog';
import PrintBonCommandeDialog from './PrintBonCommandeDialog';
import ApprovalDialog from './ApprovalDialog';
import MultipleDestinationApprovalDialog from './MultipleDestinationApprovalDialog';
import PrecommandeAlertDialog from './PrecommandeAlertDialog';
import { useBonLivraisonValidation } from '@/hooks/purchases/useBonLivraisonValidation';

interface BonCommandeTableRowProps {
  bonCommande: BonCommande;
  onView: (bon: BonCommande) => void;
  onDelete: (bon: BonCommande) => void;
}

const BonCommandeTableRow = ({ bonCommande, onView, onDelete }: BonCommandeTableRowProps) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [showMultipleDestination, setShowMultipleDestination] = useState(false);

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

    return (
      <Badge variant={variants[statut as keyof typeof variants] || 'secondary'}>
        {statut}
      </Badge>
    );
  };

  const handleApprovalClick = () => {
    if (bonCommande.articles && bonCommande.articles.some(article => article.article_id)) {
      // Vérifier s'il y a des précommandes pour les articles de ce bon de commande
      const firstArticleId = bonCommande.articles[0].article_id;
      checkPrecommandesBeforeValidation(firstArticleId, () => {
        setShowApproval(true);
      });
    } else {
      setShowApproval(true);
    }
  };

  return (
    <>
      <TableRow className="hover:bg-gray-50">
        <TableCell className="font-medium">{bonCommande.numero_bon}</TableCell>
        <TableCell>{formatDate(bonCommande.date_commande)}</TableCell>
        <TableCell>{bonCommande.fournisseur}</TableCell>
        <TableCell>{getStatutBadge(bonCommande.statut)}</TableCell>
        <TableCell className="text-right font-medium">
          {formatCurrency(bonCommande.montant_total)}
        </TableCell>
        <TableCell>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(bonCommande)}
              title="Voir les détails"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {bonCommande.statut === 'en_cours' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEdit(true)}
                title="Modifier"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrint(true)}
              title="Imprimer"
            >
              <FileText className="h-4 w-4" />
            </Button>
            
            {bonCommande.statut === 'en_cours' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleApprovalClick}
                title="Approuver et créer bon de livraison"
                className="text-green-600 hover:text-green-800"
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
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      <EditBonCommandeDialog
        bonCommande={bonCommande}
        open={showEdit}
        onClose={() => setShowEdit(false)}
      />

      <PrintBonCommandeDialog
        bonCommande={bonCommande}
        open={showPrint}
        onClose={() => setShowPrint(false)}
      />

      <ApprovalDialog
        bonCommande={bonCommande}
        open={showApproval}
        onClose={() => setShowApproval(false)}
      />

      <MultipleDestinationApprovalDialog
        bonCommande={bonCommande}
        open={showMultipleDestination}
        onClose={() => setShowMultipleDestination(false)}
      />

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
