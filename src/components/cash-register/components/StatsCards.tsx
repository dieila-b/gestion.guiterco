
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';

interface StatsCardsProps {
  soldeActif: number;
  entreesJour: number;
  depensesJour: number;
  balanceJour: number;
  nbTransactionsEntrees: number;
  nbTransactionsSorties: number;
  isLoading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  soldeActif,
  entreesJour,
  depensesJour,
  balanceJour,
  nbTransactionsEntrees,
  nbTransactionsSorties,
  isLoading = false
}) => {
  const getCurrentDate = () => {
    const today = new Date();
    return `Dernière mise à jour: ${today.toLocaleDateString('fr-FR')} ${today.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Solde actif */}
      <Card className="bg-white shadow border border-zinc-100">
        <CardContent className="p-6">
          <div className="text-sm text-zinc-500 mb-2">Solde actif</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(soldeActif)}
          </div>
          <div className="text-xs text-zinc-400">
            Caisse principale
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {getCurrentDate()}
          </div>
        </CardContent>
      </Card>

      {/* Entrées du jour */}
      <Card className="bg-white shadow border border-zinc-100">
        <CardContent className="p-6">
          <div className="text-sm text-zinc-500 mb-2">Entrées du jour</div>
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatCurrency(entreesJour)}
          </div>
          <div className="text-xs text-zinc-400">
            Total des recettes
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {nbTransactionsEntrees} transactions
          </div>
        </CardContent>
      </Card>

      {/* Dépenses du jour */}
      <Card className="bg-white shadow border border-zinc-100">
        <CardContent className="p-6">
          <div className="text-sm text-zinc-500 mb-2">Dépenses du jour</div>
          <div className="text-2xl font-bold text-red-600 mb-1">
            {formatCurrency(depensesJour)}
          </div>
          <div className="text-xs text-zinc-400">
            Total des sorties
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {nbTransactionsSorties} transaction{nbTransactionsSorties !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Balance du jour */}
      <Card className="bg-white shadow border border-zinc-100">
        <CardContent className="p-6">
          <div className="text-sm text-zinc-500 mb-2">Balance du jour</div>
          <div className={`text-2xl font-bold mb-1 ${
            balanceJour >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {formatCurrency(balanceJour)}
          </div>
          <div className="text-xs text-zinc-400">
            Entrées - Sorties
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {nbTransactionsEntrees + nbTransactionsSorties} transactions
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
