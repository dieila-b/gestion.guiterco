
import React from 'react';
import { useBonCommandeArticles } from '@/hooks/useBonCommandeArticles';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PrintBonCommandeContentProps {
  bon: any;
}

export const PrintBonCommandeContent = ({ bon }: PrintBonCommandeContentProps) => {
  const { data: articles, isLoading } = useBonCommandeArticles(bon.id);

  if (isLoading) {
    return <div className="p-4">Chargement des données...</div>;
  }

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'En attente';
      case 'valide': return 'Approuvé';
      case 'livre': return 'Livré';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  const getPaymentStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'partiel': return 'Partiel';
      case 'paye': return 'Payé';
      case 'impaye': return 'Impayé';
      default: return statut;
    }
  };

  return (
    <div className="bg-white text-black p-8 print:p-4 print:text-sm">
      {/* En-tête */}
      <div className="mb-8 print:mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl print:text-xl font-bold text-blue-600">BON DE COMMANDE</h1>
            <p className="text-gray-600 print:text-xs">Document officiel</p>
          </div>
          <div className="text-right">
            <p className="text-xl print:text-lg font-bold">{bon.numero_bon}</p>
            <p className="text-gray-600 print:text-xs">
              Date: {format(new Date(bon.date_commande), 'dd/MM/yyyy', { locale: fr })}
            </p>
          </div>
        </div>
      </div>

      {/* Informations fournisseur et commande */}
      <div className="grid grid-cols-2 gap-8 print:gap-4 mb-8 print:mb-4">
        <div>
          <h3 className="font-semibold text-lg print:text-base mb-2 print:mb-1 text-blue-600">Fournisseur</h3>
          <div className="bg-gray-50 print:bg-gray-100 p-4 print:p-2 rounded">
            <p className="font-medium">{bon.fournisseur}</p>
            {bon.fournisseur_data && (
              <div className="mt-2 print:mt-1 text-sm print:text-xs text-gray-600">
                {bon.fournisseur_data.email && <p>Email: {bon.fournisseur_data.email}</p>}
              </div>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg print:text-base mb-2 print:mb-1 text-blue-600">Détails commande</h3>
          <div className="bg-gray-50 print:bg-gray-100 p-4 print:p-2 rounded">
            <p><span className="font-medium">Statut:</span> {getStatusLabel(bon.statut)}</p>
            <p><span className="font-medium">Paiement:</span> {getPaymentStatusLabel(bon.statut_paiement)}</p>
            {bon.date_livraison_prevue && (
              <p><span className="font-medium">Livraison prévue:</span> {format(new Date(bon.date_livraison_prevue), 'dd/MM/yyyy', { locale: fr })}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des articles */}
      <div className="mb-8 print:mb-4">
        <h3 className="font-semibold text-lg print:text-base mb-4 print:mb-2 text-blue-600">Articles commandés</h3>
        <table className="w-full border-collapse border border-gray-300 print:text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 print:p-1 text-left">Article</th>
              <th className="border border-gray-300 p-3 print:p-1 text-center">Quantité</th>
              <th className="border border-gray-300 p-3 print:p-1 text-right">Prix unitaire</th>
              <th className="border border-gray-300 p-3 print:p-1 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {articles?.map((article, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3 print:p-1">
                  <div>
                    <p className="font-medium">{article.article?.nom || 'Article inconnu'}</p>
                    {article.article?.reference && (
                      <p className="text-sm print:text-xs text-gray-600">Réf: {article.article.reference}</p>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 p-3 print:p-1 text-center">{article.quantite}</td>
                <td className="border border-gray-300 p-3 print:p-1 text-right">{formatCurrency(article.prix_unitaire)}</td>
                <td className="border border-gray-300 p-3 print:p-1 text-right font-medium">{formatCurrency(article.montant_ligne)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="flex justify-end mb-8 print:mb-4">
        <div className="w-96 print:w-full">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="p-2 print:p-1 text-right font-medium">Sous-total HT:</td>
                <td className="p-2 print:p-1 text-right">{formatCurrency(bon.montant_ht)}</td>
              </tr>
              {bon.remise > 0 && (
                <tr>
                  <td className="p-2 print:p-1 text-right font-medium">Remise:</td>
                  <td className="p-2 print:p-1 text-right">-{formatCurrency(bon.remise)}</td>
                </tr>
              )}
              {bon.frais_livraison > 0 && (
                <tr>
                  <td className="p-2 print:p-1 text-right font-medium">Frais de livraison:</td>
                  <td className="p-2 print:p-1 text-right">{formatCurrency(bon.frais_livraison)}</td>
                </tr>
              )}
              {bon.frais_logistique > 0 && (
                <tr>
                  <td className="p-2 print:p-1 text-right font-medium">Frais logistiques:</td>
                  <td className="p-2 print:p-1 text-right">{formatCurrency(bon.frais_logistique)}</td>
                </tr>
              )}
              {bon.transit_douane > 0 && (
                <tr>
                  <td className="p-2 print:p-1 text-right font-medium">Transit douane:</td>
                  <td className="p-2 print:p-1 text-right">{formatCurrency(bon.transit_douane)}</td>
                </tr>
              )}
              <tr>
                <td className="p-2 print:p-1 text-right font-medium">TVA ({bon.taux_tva}%):</td>
                <td className="p-2 print:p-1 text-right">{formatCurrency(bon.tva)}</td>
              </tr>
              <tr className="border-t-2 border-gray-300">
                <td className="p-2 print:p-1 text-right font-bold text-lg print:text-base">Total TTC:</td>
                <td className="p-2 print:p-1 text-right font-bold text-lg print:text-base">{formatCurrency(bon.montant_total)}</td>
              </tr>
              {bon.montant_paye > 0 && (
                <>
                  <tr>
                    <td className="p-2 print:p-1 text-right font-medium">Montant payé:</td>
                    <td className="p-2 print:p-1 text-right">{formatCurrency(bon.montant_paye)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 print:p-1 text-right font-medium">Reste à payer:</td>
                    <td className="p-2 print:p-1 text-right font-medium">{formatCurrency(bon.montant_total - bon.montant_paye)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observations */}
      {bon.observations && (
        <div className="mb-8 print:mb-4">
          <h3 className="font-semibold text-lg print:text-base mb-2 print:mb-1 text-blue-600">Observations</h3>
          <div className="bg-gray-50 print:bg-gray-100 p-4 print:p-2 rounded">
            <p className="text-sm print:text-xs">{bon.observations}</p>
          </div>
        </div>
      )}

      {/* Pied de page */}
      <div className="mt-12 print:mt-8 pt-4 print:pt-2 border-t border-gray-300 text-center text-sm print:text-xs text-gray-600">
        <p>Document généré le {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
        <p>Ce bon de commande est valable sous réserve de nos conditions générales</p>
      </div>
    </div>
  );
};
