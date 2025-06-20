
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { PrecommandeComplete } from '@/types/precommandes';

interface PrecommandesTableProps {
  precommandes: PrecommandeComplete[];
  onConvertirEnVente: (precommande: PrecommandeComplete) => void;
}

const PrecommandesTable = ({ precommandes, onConvertirEnVente }: PrecommandesTableProps) => {
  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'livree':
        return <Badge className="bg-green-500 text-white">🟢 Livrée</Badge>;
      case 'partiellement_livree':
        return <Badge className="bg-yellow-500 text-white">🟡 Partiellement livrée</Badge>;
      case 'annulee':
        return <Badge className="bg-red-500 text-white">🔴 Annulée</Badge>;
      case 'prete':
        return <Badge className="bg-blue-500 text-white">Prête</Badge>;
      case 'en_preparation':
        return <Badge className="bg-orange-500 text-white">En préparation</Badge>;
      default:
        return <Badge variant="secondary">Confirmée</Badge>;
    }
  };

  const getDisponibiliteEstimee = (precommande: PrecommandeComplete) => {
    if (precommande.date_livraison_prevue) {
      return format(new Date(precommande.date_livraison_prevue), 'dd/MM/yyyy', { locale: fr });
    }
    return 'Non définie';
  };

  const peutConvertirEnVente = (statut: string) => {
    return ['prete', 'confirmee'].includes(statut);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Précommande</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead>Qté demandée</TableHead>
            <TableHead>Acompte</TableHead>
            <TableHead>Disponibilité estimée</TableHead>
            <TableHead>Statut de livraison</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {precommandes.map((precommande) => (
            precommande.lignes_precommande?.map((ligne, index) => (
              <TableRow key={`${precommande.id}-${ligne.id}`}>
                {index === 0 && (
                  <>
                    <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                      {precommande.numero_precommande}
                    </TableCell>
                    <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                      {precommande.client?.nom || 'Client non spécifié'}
                    </TableCell>
                  </>
                )}
                <TableCell>{ligne.article?.nom || 'Article non trouvé'}</TableCell>
                <TableCell>{ligne.quantite}</TableCell>
                {index === 0 && (
                  <>
                    <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                      {precommande.acompte_verse ? formatCurrency(precommande.acompte_verse) : '0 GNF'}
                    </TableCell>
                    <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                      {getDisponibiliteEstimee(precommande)}
                    </TableCell>
                    <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                      {getStatutBadge(precommande.statut)}
                    </TableCell>
                    <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                      {peutConvertirEnVente(precommande.statut) && (
                        <Button
                          size="sm"
                          onClick={() => onConvertirEnVente(precommande)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Convertir en vente
                        </Button>
                      )}
                    </TableCell>
                  </>
                )}
              </TableRow>
            )) || (
              <TableRow key={precommande.id}>
                <TableCell>{precommande.numero_precommande}</TableCell>
                <TableCell>{precommande.client?.nom || 'Client non spécifié'}</TableCell>
                <TableCell>Aucun produit</TableCell>
                <TableCell>0</TableCell>
                <TableCell>{precommande.acompte_verse ? formatCurrency(precommande.acompte_verse) : '0 GNF'}</TableCell>
                <TableCell>{getDisponibiliteEstimee(precommande)}</TableCell>
                <TableCell>{getStatutBadge(precommande.statut)}</TableCell>
                <TableCell>
                  {peutConvertirEnVente(precommande.statut) && (
                    <Button
                      size="sm"
                      onClick={() => onConvertirEnVente(precommande)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Convertir en vente
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PrecommandesTable;
