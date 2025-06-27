
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import type { PrecommandeComplete } from '@/types/precommandes';
import { formatCurrency } from '@/lib/currency';

interface PrecommandeFactureDialogProps {
  precommande: PrecommandeComplete | null;
  open: boolean;
  onClose: () => void;
}

const PrecommandeFactureDialog = ({ precommande, open, onClose }: PrecommandeFactureDialogProps) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    console.log('Téléchargement de la facture pour:', precommande?.numero_precommande);
  };

  if (!precommande) return null;

  const montantTotal = precommande.montant_ttc || 0;
  const acompteVerse = precommande.acompte_verse || 0;
  const resteAPayer = montantTotal - acompteVerse;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Facture - Précommande {precommande.numero_precommande}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* En-tête de facture */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold">FACTURE PRÉCOMMANDE</h1>
            <p className="text-lg font-semibold">{precommande.numero_precommande}</p>
            <p className="text-gray-600">
              Date: {new Date(precommande.date_precommande).toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Informations client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Client</h3>
              <div className="space-y-1">
                <p className="font-medium">{precommande.client?.nom}</p>
                {precommande.client?.email && (
                  <p className="text-gray-600">{precommande.client.email}</p>
                )}
                {precommande.client?.telephone && (
                  <p className="text-gray-600">{precommande.client.telephone}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Détails précommande</h3>
              <div className="space-y-1">
                <p>Statut: <span className="font-medium">{precommande.statut}</span></p>
                {precommande.date_livraison_prevue && (
                  <p>Livraison prévue: {new Date(precommande.date_livraison_prevue).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Articles */}
          <div>
            <h3 className="font-semibold mb-3">Articles commandés</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Article</th>
                    <th className="text-center p-3">Quantité</th>
                    <th className="text-right p-3">Prix unitaire</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {precommande.lignes_precommande?.map((ligne) => (
                    <tr key={ligne.id} className="border-t">
                      <td className="p-3">{ligne.article?.nom || 'Article non trouvé'}</td>
                      <td className="text-center p-3">{ligne.quantite}</td>
                      <td className="text-right p-3">{formatCurrency(ligne.prix_unitaire)}</td>
                      <td className="text-right p-3 font-medium">{formatCurrency(ligne.montant_ligne)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="space-y-2 text-right">
            <div className="text-xl font-bold border-t pt-2">
              <span>Total: </span>
              {formatCurrency(montantTotal)}
            </div>
            {acompteVerse > 0 && (
              <>
                <div className="text-lg text-green-600">
                  <span className="font-semibold">Acompte versé: </span>
                  {formatCurrency(acompteVerse)}
                </div>
                <div className="text-lg text-blue-600 font-semibold">
                  <span>Reste à payer: </span>
                  {formatCurrency(resteAPayer)}
                </div>
              </>
            )}
          </div>

          {precommande.observations && (
            <div>
              <h3 className="font-semibold mb-2">Observations</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{precommande.observations}</p>
            </div>
          )}
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrecommandeFactureDialog;
