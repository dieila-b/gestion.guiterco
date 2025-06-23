
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, FileText, Trash2, CreditCard, CheckCircle, Package } from 'lucide-react';
import type { PrecommandeComplete } from '@/types/precommandes';

interface PrecommandesTableActionsProps {
  precommande: PrecommandeComplete;
  onConvertirEnVente: (precommande: PrecommandeComplete) => void;
  onEditer: (precommande: PrecommandeComplete) => void;
  onEditerArticles: (precommande: PrecommandeComplete) => void;
  onFacture: (precommande: PrecommandeComplete) => void;
  onSupprimer: (precommande: PrecommandeComplete) => void;
  onFinaliserPaiement: (precommande: PrecommandeComplete) => void;
  isConverting: boolean;
}

const PrecommandesTableActions = ({
  precommande,
  onConvertirEnVente,
  onEditer,
  onEditerArticles,
  onFacture,
  onSupprimer,
  onFinaliserPaiement,
  isConverting
}: PrecommandesTableActionsProps) => {
  const canConvert = precommande.statut === 'prete' || precommande.statut === 'livree';
  const canFinalizePaiement = precommande.statut === 'livree' && 
    (precommande.reste_a_payer || 0) > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEditer(precommande)}>
          <Edit className="mr-2 h-4 w-4" />
          Éditer
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onEditerArticles(precommande)}>
          <Package className="mr-2 h-4 w-4" />
          Éditer articles
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onFacture(precommande)}>
          <FileText className="mr-2 h-4 w-4" />
          Facture
        </DropdownMenuItem>
        
        {canConvert && (
          <DropdownMenuItem 
            onClick={() => onConvertirEnVente(precommande)}
            disabled={isConverting}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isConverting ? 'Conversion...' : 'Convertir en vente'}
          </DropdownMenuItem>
        )}
        
        {canFinalizePaiement && (
          <DropdownMenuItem onClick={() => onFinaliserPaiement(precommande)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Finaliser paiement
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={() => onSupprimer(precommande)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PrecommandesTableActions;
