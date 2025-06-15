
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { useTodayTransactions } from "@/hooks/useTransactions";
import { useExpenses } from "@/hooks/useExpenses";
import { useTransactionsFinancieresAujourdhui } from "@/hooks/useTransactionsFinancieresAujourdhui";
import { useCashRegisterBalance } from "@/hooks/useCashRegisterBalance";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import TransactionsOverviewTable from "./TransactionsOverviewTable";

// Type guard pour transaction
function isTransaction(t: any): t is { amount: number } {
  return typeof t.amount === "number";
}

// Type guard pour dépenses
function isExpense(t: any): t is { montant: number } {
  return typeof t.montant === "number";
}

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
  const { toast } = useToast();
  
  // Caisse principale
  const { data: cashRegisters, isLoading: isLoadingRegisters } = useCashRegisters();
  const principalRegister = React.useMemo(
    () => cashRegisters?.[0],
    [cashRegisters]
  );

  // Debug: Afficher les informations de la caisse
  React.useEffect(() => {
    if (principalRegister) {
      console.log("Caisse principale trouvée:", principalRegister);
    } else if (!isLoadingRegisters) {
      console.log("Aucune caisse trouvée, caisses disponibles:", cashRegisters);
    }
  }, [principalRegister, cashRegisters, isLoadingRegisters]);

  // Solde calculé automatiquement
  const { data: calculatedBalance = 0, isLoading: isLoadingBalance, error: balanceError } = useCashRegisterBalance(principalRegister?.id);

  // Debug: Afficher les informations du solde
  React.useEffect(() => {
    console.log("Solde calculé:", calculatedBalance);
    if (balanceError) {
      console.error("Erreur lors du calcul du solde:", balanceError);
    }
  }, [calculatedBalance, balanceError]);

  // Transactions financières du jour (nouvelles données)
  const { data: transactionsFinancieresAujourdhui = [], isLoading: isLoadingTransactionsFinancieres } = useTransactionsFinancieresAujourdhui();

  // Transactions du jour (entrées/sorties)
  const { data: todayTransactions = [], isLoading: isLoadingTransactions } = useTodayTransactions(principalRegister?.id);
  // Dépenses autres (sorties_financieres)
  const { data: allExpenses = [], isLoading: isLoadingExpenses } = useExpenses();
  const todaysExtraExpenses = React.useMemo(() =>
    allExpenses.filter((e: any) =>
      isToday(new Date(e.date_sortie))
    ),
    [allExpenses]
  );

  // Entrées/sorties du jour (nouvelles données financières en priorité)
  const todayIncomes = [
    ...todayTransactions.filter(t => isTransaction(t) && t.type === "income"),
    ...transactionsFinancieresAujourdhui.filter(t => t.type === "income")
  ];
  
  const todayExpenses = [
    ...todayTransactions.filter(t => isTransaction(t) && t.type === "expense"),
    ...transactionsFinancieresAujourdhui.filter(t => t.type === "expense"),
    ...todaysExtraExpenses
  ];

  // Fonctions helpers pour obtenir le montant
  function getMontant(tx: any): number {
    if (isTransaction(tx)) return Number(tx.amount);
    if (isExpense(tx)) return Number(tx.montant);
    // Pour les nouvelles transactions financières
    if (tx.montant !== undefined) return Number(tx.montant);
    if (tx.amount !== undefined) return Number(tx.amount);
    return 0;
  }

  // Calcul des totaux
  const totals = {
    income: todayIncomes.reduce((sum, t) => sum + getMontant(t), 0),
    expense: todayExpenses.reduce((sum, t) => sum + getMontant(t), 0)
  };
  const totalBalance = totals.income - totals.expense;

  // Nb txs
  const nbIncome = todayIncomes.length;
  const nbExpense = todayExpenses.length;
  const nbTotal = todayIncomes.length + todayExpenses.length;

  // Formattage de la date
  const lastUpdate = principalRegister?.updated_at
    ? format(new Date(principalRegister.updated_at), 'dd/MM/yyyy HH:mm')
    : 'N/A';

  // Actions de gestion de caisse
  const handleCloseCashRegister = () => {
    toast({
      title: "Fermeture de caisse",
      description: "Fonction en cours de développement",
    });
  };

  const handlePrintCashStatement = () => {
    toast({
      title: "Impression état de caisse",
      description: "Fonction en cours de développement",
    });
  };

  const handlePerformCounting = () => {
    toast({
      title: "Comptage de caisse",
      description: "Fonction en cours de développement",
    });
  };

  const handleExportTransactions = () => {
    toast({
      title: "Export des transactions",
      description: "Fonction en cours de développement",
    });
  };

  // Affichage de l'état de chargement
  if (isLoadingRegisters) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des caisses...</p>
      </div>
    );
  }

  if (!principalRegister) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">Aucune caisse configurée</p>
          <p className="text-sm text-muted-foreground">Veuillez créer une caisse pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Solde actif */}
        <Card>
          <CardHeader>
            <CardTitle>Solde actif</CardTitle>
            <CardDescription>
              {principalRegister.name || 'Caisse principale'}
              {isLoadingBalance && " (Chargement...)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${calculatedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculatedBalance)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Dernière mise à jour: {lastUpdate}
            </p>
            {balanceError && (
              <p className="text-xs text-red-500 mt-1">
                Erreur de calcul
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
            <p className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalBalance)}
            </p>
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
            <Button variant="outline" className="w-full" onClick={handleCloseCashRegister}>
              Fermer la caisse
            </Button>
            <Button variant="outline" className="w-full" onClick={handlePrintCashStatement}>
              Imprimer état de caisse
            </Button>
            <Button variant="outline" className="w-full" onClick={handlePerformCounting}>
              Effectuer un comptage
            </Button>
            <Button variant="outline" className="w-full" onClick={handleExportTransactions}>
              Exporter les transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CashRegisterOverview;
