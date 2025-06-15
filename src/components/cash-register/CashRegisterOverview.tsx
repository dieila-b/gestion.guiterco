
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { useTodayTransactions } from "@/hooks/useTransactions";
import { useExpenses } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/currency";
import TransactionsOverviewTable from "./TransactionsOverviewTable";

// Utilitaire pour filtrer la date du jour
function isToday(d: Date) {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const CashRegisterOverview: React.FC = () => {
  // 1. Obtenir la caisse "principale"
  const { data: cashRegisters } = useCashRegisters();
  const principalRegister = React.useMemo(
    () => cashRegisters?.[0], // On prend la première existante, ou logiquement il faudrait filtrer 'main'
    [cashRegisters]
  );

  // 2. Transactions du jour (entrées/sorties)
  const { data: todayTransactions = [], isLoading: isLoadingTransactions } = useTodayTransactions(principalRegister?.id);
  // 3. Dépenses autres (sorties_financieres)
  const { data: allExpenses = [], isLoading: isLoadingExpenses } = useExpenses();
  // Dépenses du jour côté dépenses manuelles
  const todaysExtraExpenses = React.useMemo(() =>
    allExpenses.filter(
      (e: any) => isToday(new Date(e.date_sortie))
    ),
    [allExpenses]
  );

  // 4. Agréger
  const todayIncomes = todayTransactions.filter(t => t.type === "income");
  const todayExpenses = [
    ...todayTransactions.filter(t => t.type === "expense"),
    ...todaysExtraExpenses
  ];

  // Sommes
  const totals = {
    income: todayIncomes.reduce((sum, t) => sum + Number(t.amount ?? t.montant), 0),
    expense: todayExpenses.reduce((sum, t) => 
      sum + (t.amount !== undefined ? Number(t.amount) : Number(t.montant)), 0
    )
  };
  const totalBalance = totals.income - totals.expense;

  // Nb txs
  const nbIncome = todayIncomes.length;
  const nbExpense = todayExpenses.length;
  const nbTotal = todayTransactions.length + todaysExtraExpenses.length;

  // Formattage de la date
  const lastUpdate = principalRegister?.updated_at
    ? format(new Date(principalRegister.updated_at), 'dd/MM/yyyy HH:mm')
    : 'N/A';

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
            <p className="text-3xl font-bold">{formatCurrency(Number(principalRegister?.balance) || 0)}</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full">
              Fermer la caisse
            </Button>
            <Button variant="outline" className="w-full">
              Imprimer état de caisse
            </Button>
            <Button variant="outline" className="w-full">
              Effectuer un comptage
            </Button>
            <Button variant="outline" className="w-full">
              Exporter les transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CashRegisterOverview;
