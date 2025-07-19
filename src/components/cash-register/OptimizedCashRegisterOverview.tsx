
import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { useOptimizedTransactions } from "@/hooks/useOptimizedTransactions";
import { useOptimizedCashRegisters } from "@/hooks/useOptimizedCashRegisters";
import { useFinancialRealtime } from "@/hooks/useOptimizedRealtime";
import { OptimizedLoading, CardSkeleton } from "@/components/ui/optimized-loading";
import TransactionsOverviewTable from "./TransactionsOverviewTable";
import CashActions from "./actions/CashActions";

const OptimizedCashRegisterOverview: React.FC = () => {
  const {
    allTransactions,
    cashBalance,
    isLoadingTransactions,
    isLoadingBalance,
    fetchAllFinancialTransactions,
    fetchCashBalance
  } = useOptimizedTransactions();

  const {
    cashRegisters,
    isLoadingRegisters,
    fetchCashRegisters
  } = useOptimizedCashRegisters();

  // Connexion temps réel optimisée
  const { isConnected } = useFinancialRealtime();

  // Charger les données en parallèle au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAllFinancialTransactions(),
          fetchCashBalance(),
          fetchCashRegisters()
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [fetchAllFinancialTransactions, fetchCashBalance, fetchCashRegisters]);

  // Calculs optimisés avec memoization
  const stats = useMemo(() => {
    if (!allTransactions.length) {
      return {
        todayIncomes: [],
        todayExpenses: [],
        totals: { income: 0, expense: 0 },
        totalBalance: 0,
        nbIncome: 0,
        nbExpense: 0,
        nbTotal: 0
      };
    }

    const todayIncomes = allTransactions.filter(t => t.type === 'income');
    const todayExpenses = allTransactions.filter(t => t.type === 'expense');

    const totals = {
      income: todayIncomes.reduce((sum, t) => sum + (t.amount || 0), 0),
      expense: todayExpenses.reduce((sum, t) => sum + (t.amount || 0), 0)
    };

    return {
      todayIncomes,
      todayExpenses,
      totals,
      totalBalance: totals.income - totals.expense,
      nbIncome: todayIncomes.length,
      nbExpense: todayExpenses.length,
      nbTotal: allTransactions.length
    };
  }, [allTransactions]);

  const principalRegister = useMemo(() => cashRegisters?.[0], [cashRegisters]);
  const soldeActif = useMemo(() => 
    cashBalance?.balance ?? Number(principalRegister?.balance) ?? 0
  , [cashBalance, principalRegister]);

  const lastUpdate = useMemo(() => 
    principalRegister?.updated_at
      ? new Date(principalRegister.updated_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'N/A'
  , [principalRegister]);

  return (
    <>
      {/* Indicateur de connexion temps réel */}
      {isConnected && (
        <div className="mb-2 text-xs text-green-600 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Données en temps réel
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Solde actif */}
        {isLoadingBalance && !cashBalance ? (
          <CardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Solde actif</CardTitle>
              <CardDescription>Caisse principale</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(soldeActif)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Dernière MAJ: {lastUpdate}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Entrées du jour */}
        {isLoadingTransactions && !allTransactions.length ? (
          <CardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Entrées du jour</CardTitle>
              <CardDescription>Total des recettes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.totals.income)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.nbIncome} transaction{stats.nbIncome > 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Dépenses du jour */}
        {isLoadingTransactions && !allTransactions.length ? (
          <CardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Dépenses du jour</CardTitle>
              <CardDescription>Total des sorties</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(stats.totals.expense)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.nbExpense} transaction{stats.nbExpense > 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Balance du jour */}
        {isLoadingTransactions && !allTransactions.length ? (
          <CardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Balance du jour</CardTitle>
              <CardDescription>Entrées - Sorties</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(stats.totalBalance)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.nbTotal} transaction{stats.nbTotal > 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-col">
          {isLoadingTransactions && !allTransactions.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Historique des transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <OptimizedLoading type="skeleton" lines={8} />
              </CardContent>
            </Card>
          ) : (
            <TransactionsOverviewTable />
          )}
        </div>
        <CashActions cashRegisterId={principalRegister?.id} />
      </div>
    </>
  );
};

export default OptimizedCashRegisterOverview;
