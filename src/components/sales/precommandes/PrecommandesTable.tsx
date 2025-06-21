
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, FileText, Trash2 } from 'lucide-react';
import type { PrecommandeComplete } from '@/types/precommandes';

interface PrecommandesTableProps {
  precommandes: PrecommandeComplete[];
  onConvertirEnVente: (precommande: PrecommandeComplete) => void;
}

const PrecommandesTable = ({ precommandes, onConvertirEnVente }: PrecommandesTableProps) => {
  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'livree':
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Livrée</span>
          </div>
        );
      case 'partiellement_livree':
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Partiellement livrée</span>
          </div>
        );
      case 'annulee':
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Annulée</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>En attente</span>
          </div>
        );
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

  const handleVoir = (precommande: PrecommandeComplete) => {
    // TODO: Implémenter la vue détaillée
    console.log('Voir précommande:', precommande.numero_precommande);
  };

  const handleFacture = (precommande: PrecommandeComplete) => {
    // TODO: Implémenter la génération de facture
    console.log('Générer facture pour:', precommande.numero_precommande);
  };

  const handleSupprimer = (precommande: PrecommandeComplete) => {
    // TODO: Implémenter la suppression
    console.log('Supprimer précommande:', precommande.numero_precommande);
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
            <TableHead>Statut</TableHead>
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
                      <div className="flex flex-col gap-2">
                        {peutConvertirEnVente(precommande.statut) && (
                          <Button
                            size="sm"
                            onClick={() => onConvertirEnVente(precommande)}
                            className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
                          >
                            Convertir en vente
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVoir(precommande)}
                          className="justify-start"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFacture(precommande)}
                          className="justify-start"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Facture
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSupprimer(precommande)}
                          className="justify-start text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
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
                  <div className="flex flex-col gap-2">
                    {peutConvertirEnVente(precommande.statut) && (
                      <Button
                        size="sm"
                        onClick={() => onConvertirEnVente(precommande)}
                        className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
                      >
                        Convertir en vente
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVoir(precommande)}
                      className="justify-start"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFacture(precommande)}
                      className="justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Facture
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSupprimer(precommande)}
                      className="justify-start text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
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
