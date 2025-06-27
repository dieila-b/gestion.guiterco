
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
import { useBonCommandeApproval } from '@/hooks/useBonCommandeApproval';
import { EditBonCommandeDialog } from './EditBonCommandeDialog';
import { PrintBonCommandeDialog } from './PrintBonCommandeDialog';
import { ViewBonCommandeDialog } from './ViewBonCommandeDialog';
import { DeleteBonCommandeDialog } from './DeleteBonCommandeDialog';

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
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { handleApprove } = useBonCommandeApproval();

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

  const handleView = () => {
    console.log('Viewing bon commande:', bonCommande);
    setShowView(true);
    onView(bonCommande);
  };

  const handleEdit = () => {
    console.log('Editing bon commande:', bonCommande);
    setShowEdit(true);
  };

  const handleDelete = () => {
    console.log('Deleting bon commande:', bonCommande);
    setShowDelete(true);
  };

  const handlePrint = () => {
    console.log('Printing bon commande:', bonCommande);
    setShowPrint(true);
  };

  const handleApprovalClick = async () => {
    console.log('Approving bon commande:', bonCommande);
    try {
      await handleApprove(bonCommande.id, bonCommande);
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(bonCommande);
    setShowDelete(false);
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
              onClick={handleView}
              title="Voir les détails"
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {bonCommande.statut === 'en_cours' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                title="Modifier"
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              title="Imprimer"
              className="h-8 w-8 p-0"
            >
              <FileText className="h-4 w-4" />
            </Button>
            
            {bonCommande.statut === 'en_cours' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleApprovalClick}
                  title="Approuver et créer bon de livraison"
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                >
                  <Check className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  title="Supprimer"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Dialogs */}
      <ViewBonCommandeDialog 
        bonCommande={bonCommande}
        open={showView}
        onClose={() => setShowView(false)}
      />

      <EditBonCommandeDialog 
        bon={bonCommande}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={() => setShowEdit(false)}
      />

      <PrintBonCommandeDialog 
        bon={bonCommande}
        open={showPrint}
        onClose={() => setShowPrint(false)}
      />

      <DeleteBonCommandeDialog 
        bonCommande={bonCommande}
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default BonCommandeTableRow;
