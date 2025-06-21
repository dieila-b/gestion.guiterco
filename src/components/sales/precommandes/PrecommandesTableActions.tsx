
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, FileText, Trash2, ArrowRightLeft, CheckCircle } from 'lucide-react';
import type { PrecommandeComplete } from '@/types/precommandes';
import { peutConvertirEnVente, peutFinaliserPaiement } from './PrecommandesTableUtils';

interface PrecommandesTableActionsProps {
  precommande: PrecommandeComplete;
  onConvertirEnVente: (precommande: PrecommandeComplete) => void;
  onEditer: (precommande: PrecommandeComplete) => void;
  onFacture: (precommande: PrecommandeComplete) => void;
  onSupprimer: (precommande: PrecommandeComplete) => void;
  onFinaliserPaiement: (precommande: PrecommandeComplete) => void;
  isConverting: boolean;
}

const PrecommandesTableActions = ({
  precommande,
  onConvertirEnVente,
  onEditer,
  onFacture,
  onSupprimer,
  onFinaliserPaiement,
  isConverting
}: PrecommandesTableActionsProps) => {
  return (
    <div className="flex gap-1 flex-wrap">
      {peutFinaliserPaiement(precommande) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onFinaliserPaiement(precommande)}
          title="Finaliser le paiement"
          className="text-blue-600 hover:text-blue-700"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      )}
      {peutConvertirEnVente(precommande.statut) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onConvertirEnVente(precommande)}
          title="Convertir en vente"
          disabled={isConverting}
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEditer(precommande)}
        title="Éditer la précommande"
        className="text-green-600 hover:text-green-700"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onFacture(precommande)}
        title="Voir la facture"
        className="text-blue-600 hover:text-blue-700"
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onSupprimer(precommande)}
        title="Supprimer la précommande"
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PrecommandesTableActions;
