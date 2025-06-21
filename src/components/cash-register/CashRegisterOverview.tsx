
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

  // Solde actif calculé depuis toutes les sources
  const { data: balanceData, isLoading: isLoadingBalance } = useCashRegisterBalance();

  // Toutes les transactions financières du jour
  const { data: allTransactions = [], isLoading: isLoadingTransactions } = useAllFinancialTransactions();

  // Calcul des totaux basé sur les transactions unifiées
  const todayIncomes = allTransactions.filter(t => t.type === 'income');
  const todayExpenses = allTransactions.filter(t => t.type === 'expense');

  const totals = {
    income: todayIncomes.reduce((sum, t) => sum + (t.amount || 0), 0),
    expense: todayExpenses.reduce((sum, t) => sum + (t.amount || 0), 0)
  };
  const totalBalance = totals.income - totals.expense;

  // Nb txs
  const nbIncome = todayIncomes.length;
  const nbExpense = todayExpenses.length;
  const nbTotal = allTransactions.length;

  // Formattage de la date
  const lastUpdate = principalRegister?.updated_at
    ? new Date(principalRegister.updated_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  // Gestion du loading
  if (isLoadingRegisters || isLoadingTransactions || isLoadingBalance) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des données financières...</p>
      </div>
    );
  }

  // Utiliser le solde calculé ou le solde de la caisse comme fallback
  const soldeActif = balanceData?.balance ?? Number(principalRegister?.balance) ?? 0;

  console.log('🏦 Affichage Aperçu:', {
    soldeActif,
    entrées: totals.income,
    sorties: totals.expense,
    balance: totalBalance,
    nbTransactions: nbTotal
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Solde actif */}
        <Card>
          <CardHeader>
            <CardTitle>Solde actif</CardTitle>
            <CardDescription>Caisse principale</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(soldeActif)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Dernière mise à jour: {lastUpdate}
            </p>
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
