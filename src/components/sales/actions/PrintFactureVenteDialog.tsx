import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { calculatePaidAmount, calculateRemainingAmount, getActualPaymentStatus, getActualDeliveryStatus } from '../table/StatusUtils';
import type { FactureVente } from '@/types/sales';

interface PrintFactureVenteDialogProps {
  facture: FactureVente;
}

// Fonction pour convertir un nombre en toutes lettres (simplifiée pour le français guinéen)
const numberToWords = (amount: number): string => {
  if (amount === 0) return 'zéro';
  
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];
  const thousands = ['', 'mille', 'million', 'milliard'];
  
  const convertGroup = (num: number): string => {
    if (num === 0) return '';
    
    let result = '';
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    
    if (hundreds > 0) {
      if (hundreds === 1) {
        result += 'cent';
      } else {
        result += units[hundreds] + ' cent';
      }
      if (remainder > 0) result += ' ';
    }
    
    if (remainder >= 20) {
      const tenDigit = Math.floor(remainder / 10);
      const unitDigit = remainder % 10;
      result += tens[tenDigit];
      if (unitDigit > 0) {
        result += '-' + units[unitDigit];
      }
    } else if (remainder >= 10) {
      result += teens[remainder - 10];
    } else if (remainder > 0) {
      result += units[remainder];
    }
    
    return result;
  };
  
  // Conversion simplifiée - pour un système complet, il faudrait gérer tous les cas
  const roundedAmount = Math.round(amount);
  if (roundedAmount < 1000) {
    return convertGroup(roundedAmount) + ' francs guinéens';
  } else if (roundedAmount < 1000000) {
    const thousands = Math.floor(roundedAmount / 1000);
    const remainder = roundedAmount % 1000;
    let result = convertGroup(thousands) + ' mille';
    if (remainder > 0) {
      result += ' ' + convertGroup(remainder);
    }
    return result + ' francs guinéens';
  } else {
    return 'un million ' + Math.floor(roundedAmount / 1000000) + ' francs guinéens'; // Simplification
  }
};

export const PrintFactureVenteDialog = ({ facture }: PrintFactureVenteDialogProps) => {
  const [open, setOpen] = useState(false);
  
  const paidAmount = calculatePaidAmount(facture);
  const remainingAmount = calculateRemainingAmount(facture);
  const paymentStatus = getActualPaymentStatus(facture);
  const deliveryStatus = getActualDeliveryStatus(facture);
  
  const handlePrint = () => {
    window.print();
  };

  const getPaymentStatusMessage = () => {
    if (paymentStatus === 'partiellement_payee') {
      return 'Un paiement partiel a été effectué sur cette facture.';
    } else if (paymentStatus === 'payee') {
      return 'Cette facture a été entièrement payée.';
    }
    return 'Aucun paiement effectué sur cette facture.';
  };

  const getDeliveryStatusMessage = () => {
    if (deliveryStatus === 'partiellement_livree') {
      return 'Cette commande a été partiellement livrée.';
    } else if (deliveryStatus === 'livree') {
      return 'Cette commande a été entièrement livrée.';
    }
    return 'Cette commande est en attente de livraison.';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
        >
          <Printer className="mr-1 h-3 w-3" />
          Imprimer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle>Aperçu de la facture de vente</DialogTitle>
        </DialogHeader>
        
        <div className="print-content bg-white p-8 text-black print:p-0">
          {/* En-tête avec informations de l'entreprise */}
          <div className="flex items-start justify-between mb-8 border-b pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                Logo
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">Ets Aicha Business Alphaya</h1>
                <p className="text-sm">Madina-Gare routière Kankan C/Matam</p>
                <p className="text-sm">+224 613 98 11 24 / 625 72 76 93</p>
                <p className="text-sm">etsaichabusinessalphaya@gmail.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold border-2 border-black px-4 py-2">FACTURE</h2>
            </div>
          </div>

          {/* Informations facture et client */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-2">FACTURE</h3>
              <p><strong>DATE:</strong> {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}</p>
              <p><strong>FACTURE N°:</strong> {facture.numero_facture}</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">CLIENT:</h3>
              <p><strong>Nom:</strong> {facture.client?.nom || 'Client non spécifié'}</p>
              <p><strong>Téléphone:</strong> {facture.client?.telephone || 'Non renseigné'}</p>
              <p><strong>Adresse:</strong> {facture.client?.adresse || 'Non renseignée'}</p>
              <p><strong>Email:</strong> {facture.client?.email || 'Non renseigné'}</p>
              <p><strong>Code:</strong> {facture.client?.id || 'Non attribué'}</p>
            </div>
          </div>

          {/* Tableau des produits */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left">Produit</th>
                  <th className="border border-black p-2 text-right">Prix unitaire</th>
                  <th className="border border-black p-2 text-right">Remise</th>
                  <th className="border border-black p-2 text-right">Prix net</th>
                  <th className="border border-black p-2 text-center">Qté</th>
                  <th className="border border-black p-2 text-center">Livré</th>
                  <th className="border border-black p-2 text-center">Restant</th>
                  <th className="border border-black p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {facture.lignes_facture && facture.lignes_facture.length > 0 ? (
                  facture.lignes_facture.map((ligne: any, index: number) => {
                    const remise = 0; // À calculer selon votre logique métier
                    const prixNet = ligne.prix_unitaire - remise;
                    const livre = ligne.statut_livraison === 'livree' ? ligne.quantite : 0;
                    const restant = ligne.quantite - livre;
                    
                    return (
                      <tr key={ligne.id || index}>
                        <td className="border border-black p-2">{ligne.article?.nom || 'Article'}</td>
                        <td className="border border-black p-2 text-right">{formatCurrency(ligne.prix_unitaire)}</td>
                        <td className="border border-black p-2 text-right">{formatCurrency(remise)}</td>
                        <td className="border border-black p-2 text-right">{formatCurrency(prixNet)}</td>
                        <td className="border border-black p-2 text-center">{ligne.quantite}</td>
                        <td className="border border-black p-2 text-center text-green-600">{livre}</td>
                        <td className="border border-black p-2 text-center text-orange-600">{restant}</td>
                        <td className="border border-black p-2 text-right">{formatCurrency(ligne.montant_ligne)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="border border-black p-4 text-center text-gray-500">
                      Aucun article trouvé pour cette facture
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Résumé du montant */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div></div>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Montant Total</span>
                <span className="font-semibold">{formatCurrency(facture.montant_ttc)}</span>
              </div>
              <div className="flex justify-between">
                <span>Remise</span>
                <span>{formatCurrency(facture.montant_ttc - facture.montant_ht - facture.tva)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Net A Payer</span>
                <span>{formatCurrency(facture.montant_ttc)}</span>
              </div>
            </div>
          </div>

          {/* Montant en toutes lettres */}
          <div className="mb-8 text-sm italic border-t pt-4">
            Arrête la présente facture à la somme de: <strong>{numberToWords(facture.montant_ttc)}</strong>
          </div>

          {/* Statut de paiement et livraison */}
          <div className="grid grid-cols-2 gap-8">
            <div className="border border-black p-4">
              <h4 className="font-bold mb-3">Statut de paiement</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Statut:</span>
                  <span className={`font-semibold ${
                    paymentStatus === 'payee' ? 'text-green-600' : 
                    paymentStatus === 'partiellement_payee' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {paymentStatus === 'payee' ? 'Entièrement payé' : 
                     paymentStatus === 'partiellement_payee' ? 'Partiellement payé' : 'En attente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Montant payé:</span>
                  <span className="font-semibold">{formatCurrency(paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Montant restant:</span>
                  <span className="font-semibold">{formatCurrency(remainingAmount)}</span>
                </div>
              </div>
            </div>
            
            <div className="border border-black p-4">
              <h4 className="font-bold mb-3">Statut de livraison</h4>
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span>Statut:</span>
                  <span className={`font-semibold ${
                    deliveryStatus === 'livree' ? 'text-green-600' : 
                    deliveryStatus === 'partiellement_livree' ? 'text-yellow-600' : 'text-orange-600'
                  }`}>
                    {deliveryStatus === 'livree' ? 'Entièrement livré' : 
                     deliveryStatus === 'partiellement_livree' ? 'Partiellement livré' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages personnalisés */}
          <div className="mt-6 space-y-2">
            {(paymentStatus === 'partiellement_payee' || paymentStatus === 'payee') && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
                <span className="text-yellow-700">📝 {getPaymentStatusMessage()}</span>
              </div>
            )}
            {(deliveryStatus === 'partiellement_livree' || deliveryStatus === 'livree') && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm">
                <span className="text-blue-700">🚚 {getDeliveryStatusMessage()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 print:hidden">
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
