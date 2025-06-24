
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/currency';
import type { PrecommandeComplete } from '@/types/precommandes';
import PrecommandesStatusBadge from './PrecommandesStatusBadge';
import PrecommandesTableActions from './PrecommandesTableActions';
import { PrecommandesPaymentInfo } from './PrecommandesPaymentInfo';
import {
  getDisponibiliteEstimee,
  calculerTotalPrecommande,
  calculerResteAPayer
} from './PrecommandesTableUtils';

interface PrecommandesTableRowProps {
  precommande: PrecommandeComplete;
  onConvertirEnVente: (precommande: PrecommandeComplete) => void;
  onEditer: (precommande: PrecommandeComplete) => void;
  onFacture: (precommande: PrecommandeComplete) => void;
  onSupprimer: (precommande: PrecommandeComplete) => void;
  isConverting: boolean;
}

const PrecommandesTableRow = ({
  precommande,
  onConvertirEnVente,
  onEditer,
  onFacture,
  onSupprimer,
  isConverting
}: PrecommandesTableRowProps) => {
  // Si la précommande a des lignes, on les affiche
  if (precommande.lignes_precommande && precommande.lignes_precommande.length > 0) {
    return (
      <>
        {precommande.lignes_precommande.map((ligne, index) => (
          <TableRow key={`${precommande.id}-${ligne.id}`}>
            {index === 0 && (
              <>
                <TableCell rowSpan={precommande.lignes_precommande?.length || 1} className="font-medium">
                  {precommande.numero_precommande}
                </TableCell>
                <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                  {precommande.client?.nom || 'Client non spécifié'}
                </TableCell>
              </>
            )}
            <TableCell>{ligne.article?.nom || 'Article non trouvé'}</TableCell>
            <TableCell className="text-center">{ligne.quantite}</TableCell>
            {index === 0 && (
              <>
                <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                  <PrecommandesPaymentInfo precommande={precommande} />
                </TableCell>
                <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                  {getDisponibiliteEstimee(precommande)}
                </TableCell>
                <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                  <PrecommandesStatusBadge statut={precommande.statut} />
                </TableCell>
                <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                  <PrecommandesTableActions
                    precommande={precommande}
                    onConvertirEnVente={onConvertirEnVente}
                    onEditer={onEditer}
                    onFacture={onFacture}
                    onSupprimer={onSupprimer}
                    isConverting={isConverting}
                  />
                </TableCell>
              </>
            )}
          </TableRow>
        ))}
      </>
    );
  }

  // Si pas de lignes, on affiche une ligne vide
  return (
    <TableRow key={precommande.id}>
      <TableCell className="font-medium">{precommande.numero_precommande}</TableCell>
      <TableCell>{precommande.client?.nom || 'Client non spécifié'}</TableCell>
      <TableCell>Aucun produit</TableCell>
      <TableCell className="text-center">0</TableCell>
      <TableCell>
        <PrecommandesPaymentInfo precommande={precommande} />
      </TableCell>
      <TableCell>{getDisponibiliteEstimee(precommande)}</TableCell>
      <TableCell>
        <PrecommandesStatusBadge statut={precommande.statut} />
      </TableCell>
      <TableCell>
        <PrecommandesTableActions
          precommande={precommande}
          onConvertirEnVente={onConvertirEnVente}
          onEditer={onEditer}
          onFacture={onFacture}
          onSupprimer={onSupprimer}
          isConverting={isConverting}
        />
      </TableCell>
    </TableRow>
  );
};

export default PrecommandesTableRow;
