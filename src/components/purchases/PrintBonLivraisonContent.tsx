
import React from 'react';
import { useBonLivraisonArticles } from '@/hooks/useBonLivraisonArticles';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PrintBonLivraisonContentProps {
  bon: any;
}

export const PrintBonLivraisonContent = ({ bon }: PrintBonLivraisonContentProps) => {
  const { data: articles } = useBonLivraisonArticles(bon?.id);

  const calculateTotal = () => {
    if (!articles) return 0;
    return articles.reduce((sum, article) => sum + (article.montant_ligne || 0), 0);
  };

  const destinationName = bon.entrepot_destination?.nom || bon.point_vente_destination?.nom || 'Non spécifié';

  return (
    <div className="bg-white p-8 print:p-6 text-black max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">BON DE LIVRAISON</h1>
        <p className="text-lg text-gray-600">N° {bon.numero_bon}</p>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Informations Fournisseur</h2>
          <div className="space-y-2">
            <p><strong>Fournisseur:</strong> {bon.fournisseur}</p>
            <p><strong>Date de livraison:</strong> {format(new Date(bon.date_livraison), 'dd/MM/yyyy', { locale: fr })}</p>
            {bon.transporteur && <p><strong>Transporteur:</strong> {bon.transporteur}</p>}
            {bon.numero_suivi && <p><strong>N° de suivi:</strong> {bon.numero_suivi}</p>}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Destination</h2>
          <div className="space-y-2">
            <p><strong>Destination:</strong> {destinationName}</p>
            <p><strong>Type:</strong> {bon.entrepot_destination ? 'Entrepôt' : 'Point de vente'}</p>
            <p><strong>Statut:</strong> {bon.statut === 'en_transit' ? 'En attente' : bon.statut === 'receptionne' ? 'Reçu' : bon.statut}</p>
            {bon.bon_commande?.numero_bon && (
              <p><strong>Bon de commande:</strong> {bon.bon_commande.numero_bon}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des articles */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Articles</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left">Article</th>
              <th className="border border-gray-300 p-3 text-left">Référence</th>
              <th className="border border-gray-300 p-3 text-center">Qté commandée</th>
              <th className="border border-gray-300 p-3 text-center">Qté reçue</th>
              <th className="border border-gray-300 p-3 text-right">Prix unitaire</th>
              <th className="border border-gray-300 p-3 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {articles?.map((article, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">{article.catalogue?.nom || 'Article inconnu'}</td>
                <td className="border border-gray-300 p-3">{article.catalogue?.reference || 'N/A'}</td>
                <td className="border border-gray-300 p-3 text-center">{article.quantite_commandee}</td>
                <td className="border border-gray-300 p-3 text-center">{article.quantite_recue || 0}</td>
                <td className="border border-gray-300 p-3 text-right">{formatCurrency(article.prix_unitaire)}</td>
                <td className="border border-gray-300 p-3 text-right">{formatCurrency(article.montant_ligne)}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan={6} className="border border-gray-300 p-3 text-center text-gray-500">
                  Aucun article trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Observations */}
      {bon.observations && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Observations</h2>
          <div className="border border-gray-300 p-4 bg-gray-50">
            <p>{bon.observations}</p>
          </div>
        </div>
      )}

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="text-center">
          <div className="border-t border-gray-400 pt-2 mt-16">
            <p className="font-semibold">Signature du livreur</p>
            <p className="text-sm text-gray-600">Date et cachet</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 pt-2 mt-16">
            <p className="font-semibold">Signature du réceptionnaire</p>
            <p className="text-sm text-gray-600">Date et cachet</p>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="text-center text-sm text-gray-500 mt-8 border-t border-gray-200 pt-4">
        <p>Bon de livraison généré le {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
      </div>
    </div>
  );
};
