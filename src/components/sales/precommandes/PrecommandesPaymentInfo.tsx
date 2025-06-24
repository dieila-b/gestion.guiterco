
import React from 'react';
import { formatCurrency } from '@/lib/currency';
import type { PrecommandeComplete } from '@/types/precommandes';

interface PrecommandesPaymentInfoProps {
  precommande: PrecommandeComplete;
}

export const PrecommandesPaymentInfo = ({ precommande }: PrecommandesPaymentInfoProps) => {
  const montantTTC = precommande.montant_ttc || 0;
  const acompteVerse = precommande.acompte_verse || 0;
  const resteAPayer = montantTTC - acompteVerse;
  
  const getStatutPaiement = () => {
    if (acompteVerse === 0) return { label: 'Non payé', color: 'text-red-600 bg-red-50' };
    if (acompteVerse >= montantTTC) return { label: 'Payé', color: 'text-green-600 bg-green-50' };
    return { label: 'Partiel', color: 'text-orange-600 bg-orange-50' };
  };

  const statutPaiement = getStatutPaiement();

  return (
    <div className="space-y-1">
      <div className="text-sm">
        <span className="font-medium">Total:</span> {formatCurrency(montantTTC)}
      </div>
      <div className="text-sm">
        <span className="font-medium">Payé:</span> {formatCurrency(acompteVerse)}
      </div>
      <div className="text-sm font-bold text-blue-600">
        <span>Reste:</span> {formatCurrency(resteAPayer)}
      </div>
      <div className="text-xs">
        <span className={`px-2 py-1 rounded ${statutPaiement.color}`}>
          {statutPaiement.label}
        </span>
      </div>
    </div>
  );
};
