
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { useAllFinancialTransactions, useCashRegisterBalance } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/currency";
import TransactionsOverviewTable from "./TransactionsOverviewTable";
import CashActions from "./actions/CashActions";

const CashRegisterOverview: React.FC = () => {
  // Caisse principale
  const { data: cashRegisters, isLoading: isLoadingRegisters } = useCashRegisters();
  const principalRegister = React.useMemo(
    () => cashRegisters?.[0],
    [cashRegisters]
  );

  // Données financières avec gestion d'erreur robuste
  const { data: balanceData, isLoading: isLoadingBalance, error: balanceError } = useCashRegisterBalance();
  const { data: allTransactions = [], isLoading: isLoadingTransactions, error: transactionsError } = useAllFinancialTransactions();

  // Calcul des totaux
  const todayIncomes = allTransactions.filter(t => t.type === 'income');
  const todayExpenses = allTransactions.filter(t => t.type === 'expense');

  const totals = {
    income: todayIncomes.reduce((sum, t) => sum + (t.amount || 0), 0),
    expense: todayExpenses.reduce((sum, t) => sum + (t.amount || 0), 0)
  };
  const totalBalance = totals.income - totals.expense;

  // Comptage des transactions
  const nbIncome = todayIncomes.length;
  const nbExpense = todayExpenses.length;
  const nbTotal = allTransactions.length;

  // Date de mise à jour
  const lastUpdate = principalRegister?.updated_at
    ? new Date(principalRegister.updated_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  // Gestion des erreurs
  if (balanceError || transactionsError) {
    console.warn('⚠️ Erreurs détectées:', { balanceError, transactionsError });
  }

  // Affichage du loading seulement si toutes les données sont en cours de chargement
  const isFullyLoading = isLoadingRegisters && isLoadingTransactions && isLoadingBalance;
  
  if (isFullyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Chargement des données financières...</p>
        </div>
      </div>
    );
  }

  // Utiliser les données disponibles même en cas d'erreur partielle
  const soldeActif = balanceData?.balance ?? Number(principalRegister?.balance) ?? 0;

  console.log('🏦 Affichage Aperçu:', {
    soldeActif,
    entrées: totals.income,
    sorties: totals.expense,
    balance: totalBalance,
    nbTransactions: nbTotal,
    erreurs: { balanceError: !!balanceError, transactionsError: !!transactionsError }
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Solde actif */}
        <Card>
          <CardHeader>
            <CardTitle>Solde actif</CardTitle>
            <CardDescription>
              {balanceError ? "Calcul approximatif" : "Caisse principale"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(soldeActif)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Dernière mise à jour: {lastUpdate}
            </p>
            {balanceError && (
              <p className="text-xs text-orange-500 mt-1">
                ⚠️ Données partielles
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Entrées du jour */}
        <Card>
          <CardHeader>
            <CardTitle>Entrées du jour</CardTitle>
            <CardDescription>Total des recettes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totals.income)}</p>
            <p className="text-sm text-muted-foreground mt-1">{nbIncome} transaction{nbIncome > 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
        
        {/* Dépenses du jour */}
        <Card>
          <CardHeader>
            <CardTitle>Dépenses du jour</CardTitle>
            <CardDescription>Total des sorties</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totals.expense)}</p>
            <p className="text-sm text-muted-foreground mt-1">{nbExpense} transaction{nbExpense > 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
        
        {/* Balance du jour */}
        <Card>
          <CardHeader>
            <CardTitle>Balance du jour</CardTitle>
            <CardDescription>Entrées - Sorties</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalBalance)}</p>
            <p className="text-sm text-muted-foreground mt-1">{nbTotal} transaction{nbTotal > 1 ? "s" : ""}</p>
            {transactionsError && (
              <p className="text-xs text-orange-500 mt-1">
                ⚠️ Données partielles
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-col">
          <TransactionsOverviewTable />
        </div>
        <CashActions cashRegisterId={principalRegister?.id} />
      </div>
    </>
  );
};

export default CashRegisterOverview;
