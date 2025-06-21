import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, FileText, Trash2, ArrowRightLeft, CreditCard, CheckCircle } from 'lucide-react';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useConvertPrecommandeToSale } from '@/hooks/precommandes/useConvertPrecommandeToSale';
import PaymentDialog from './PaymentDialog';

interface PrecommandesTableProps {
  precommandes: PrecommandeComplete[];
}

const PrecommandesTable = ({ precommandes }: PrecommandesTableProps) => {
  const convertToSale = useConvertPrecommandeToSale();
  const [paymentDialog, setPaymentDialog] = useState<{
    precommande: PrecommandeComplete;
    type: 'acompte' | 'solde';
  } | null>(null);

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'livree':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Livrée
          </Badge>
        );
      case 'partiellement_livree':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            Partiellement livrée
          </Badge>
        );
      case 'annulee':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Annulée
          </Badge>
        );
      case 'convertie_en_vente':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Convertie en vente
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            En attente
          </Badge>
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

  const peutRecevoirAcompte = (precommande: PrecommandeComplete) => {
    const montantTotal = calculerTotalPrecommande(precommande);
    const acompteVerse = precommande.acompte_verse || 0;
    return acompteVerse < montantTotal && !['livree', 'annulee', 'convertie_en_vente'].includes(precommande.statut);
  };

  const peutFinaliserPaiement = (precommande: PrecommandeComplete) => {
    const montantTotal = calculerTotalPrecommande(precommande);
    const acompteVerse = precommande.acompte_verse || 0;
    return acompteVerse > 0 && acompteVerse < montantTotal && ['prete', 'confirmee'].includes(precommande.statut);
  };

  const handleConvertirEnVente = (precommande: PrecommandeComplete) => {
    convertToSale.mutate(precommande.id);
  };

  const handleVoir = (precommande: PrecommandeComplete) => {
    console.log('Voir précommande:', precommande.numero_precommande);
  };

  const handleFacture = (precommande: PrecommandeComplete) => {
    console.log('Générer facture pour:', precommande.numero_precommande);
  };

  const handleSupprimer = (precommande: PrecommandeComplete) => {
    console.log('Supprimer précommande:', precommande.numero_precommande);
  };

  const calculerTotalPrecommande = (precommande: PrecommandeComplete) => {
    return precommande.lignes_precommande?.reduce((sum, ligne) => sum + ligne.montant_ligne, 0) || 0;
  };

  const calculerResteAPayer = (precommande: PrecommandeComplete) => {
    const total = calculerTotalPrecommande(precommande);
    return total - (precommande.acompte_verse || 0);
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Précommande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Qté demandée</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Acompte</TableHead>
              <TableHead>Reste à payer</TableHead>
              <TableHead>Disponibilité estimée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {precommandes.map((precommande) => (
              precommande.lignes_precommande?.map((ligne, index) => (
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
                      <TableCell rowSpan={precommande.lignes_precommande?.length || 1} className="font-semibold">
                        {formatCurrency(calculerTotalPrecommande(precommande))}
                      </TableCell>
                      <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                        {precommande.acompte_verse ? formatCurrency(precommande.acompte_verse) : '0 GNF'}
                      </TableCell>
                      <TableCell rowSpan={precommande.lignes_precommande?.length || 1} className="font-semibold text-blue-600">
                        {formatCurrency(calculerResteAPayer(precommande))}
                      </TableCell>
                      <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                        {getDisponibiliteEstimee(precommande)}
                      </TableCell>
                      <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                        {getStatutBadge(precommande.statut)}
                      </TableCell>
                      <TableCell rowSpan={precommande.lignes_precommande?.length || 1}>
                        <div className="flex gap-1 flex-wrap">
                          {peutRecevoirAcompte(precommande) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPaymentDialog({ precommande, type: 'acompte' })}
                              title="Acompte"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                          {peutFinaliserPaiement(precommande) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPaymentDialog({ precommande, type: 'solde' })}
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
                              onClick={() => handleConvertirEnVente(precommande)}
                              title="Convertir en vente"
                              disabled={convertToSale.isPending}
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVoir(precommande)}
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFacture(precommande)}
                            title="Facture"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSupprimer(precommande)}
                            title="Supprimer"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              )) || (
                <TableRow key={precommande.id}>
                  <TableCell className="font-medium">{precommande.numero_precommande}</TableCell>
                  <TableCell>{precommande.client?.nom || 'Client non spécifié'}</TableCell>
                  <TableCell>Aucun produit</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(0)}</TableCell>
                  <TableCell>{precommande.acompte_verse ? formatCurrency(precommande.acompte_verse) : '0 GNF'}</TableCell>
                  <TableCell className="font-semibold text-blue-600">{formatCurrency(0)}</TableCell>
                  <TableCell>{getDisponibiliteEstimee(precommande)}</TableCell>
                  <TableCell>{getStatutBadge(precommande.statut)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {peutRecevoirAcompte(precommande) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPaymentDialog({ precommande, type: 'acompte' })}
                          title="Acompte"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      )}
                      {peutFinaliserPaiement(precommande) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPaymentDialog({ precommande, type: 'solde' })}
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
                          onClick={() => handleConvertirEnVente(precommande)}
                          title="Convertir en vente"
                          disabled={convertToSale.isPending}
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVoir(precommande)}
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFacture(precommande)}
                        title="Facture"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSupprimer(precommande)}
                        title="Supprimer"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            ))}
          </TableBody>
        </Table>
      </div>

      {paymentDialog && (
        <PaymentDialog
          precommande={paymentDialog.precommande}
          type={paymentDialog.type}
          open={true}
          onClose={() => setPaymentDialog(null)}
        />
      )}
    </>
  );
};

export default PrecommandesTable;
