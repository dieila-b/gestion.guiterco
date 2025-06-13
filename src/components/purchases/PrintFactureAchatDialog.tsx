
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useFactureAchatArticles } from '@/hooks/useFactureAchatArticles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

interface PrintFactureAchatDialogProps {
  facture: any;
}

export const PrintFactureAchatDialog = ({ facture }: PrintFactureAchatDialogProps) => {
  const [open, setOpen] = useState(false);
  const { data: articles } = useFactureAchatArticles(facture.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
        >
          Imprimer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aperçu de la facture d'achat</DialogTitle>
        </DialogHeader>
        
        <div className="print-content bg-white p-8 text-black">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">FACTURE D'ACHAT</h1>
            <p className="text-lg">N° {facture.numero_facture}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Fournisseur :</h3>
              <p>{facture.fournisseur}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Informations facture :</h3>
              <p>Date : {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}</p>
              {facture.date_echeance && (
                <p>Échéance : {format(new Date(facture.date_echeance), 'dd/MM/yyyy', { locale: fr })}</p>
              )}
              <p>Statut : {facture.statut_paiement}</p>
            </div>
          </div>

          {articles && articles.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Articles :</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Référence</th>
                    <th className="border border-gray-300 p-2 text-left">Nom</th>
                    <th className="border border-gray-300 p-2 text-center">Quantité</th>
                    <th className="border border-gray-300 p-2 text-right">Prix unitaire</th>
                    <th className="border border-gray-300 p-2 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article: any) => (
                    <tr key={article.id}>
                      <td className="border border-gray-300 p-2">{article.catalogue?.reference}</td>
                      <td className="border border-gray-300 p-2">{article.catalogue?.nom}</td>
                      <td className="border border-gray-300 p-2 text-center">{article.quantite}</td>
                      <td className="border border-gray-300 p-2 text-right">{formatCurrency(article.prix_unitaire)}</td>
                      <td className="border border-gray-300 p-2 text-right">{formatCurrency(article.montant_ligne)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            <div>
              {facture.observations && (
                <div>
                  <h3 className="font-semibold mb-2">Observations :</h3>
                  <p className="text-sm">{facture.observations}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Montant HT :</span>
                <span>{formatCurrency(facture.montant_ht)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA :</span>
                <span>{formatCurrency(facture.tva)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total TTC :</span>
                <span>{formatCurrency(facture.montant_ttc)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
