
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

interface CompleteHistoryStatsCardsProps {
  stats: {
    soldeActif: number;
    totalEntrees: number;
    totalSorties: number;
    balance: number;
  };
}

const CompleteHistoryStatsCards: React.FC<CompleteHistoryStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Solde actif */}
      <Card>
        <CardHeader>
          <CardTitle>Solde actif</CardTitle>
          <CardDescription>Solde total de la caisse</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(stats.soldeActif)}</p>
        </CardContent>
      </Card>
      
      {/* Total des entrées */}
      <Card>
        <CardHeader>
          <CardTitle>Total des entrées</CardTitle>
          <CardDescription>Période filtrée</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalEntrees)}</p>
        </CardContent>
      </Card>
      
      {/* Total des dépenses */}
      <Card>
        <CardHeader>
          <CardTitle>Total des dépenses</CardTitle>
          <CardDescription>Période filtrée</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.totalSorties)}</p>
        </CardContent>
      </Card>
      
      {/* Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Balance</CardTitle>
          <CardDescription>Entrées - Sorties</CardDescription>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.balance)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteHistoryStatsCards;
