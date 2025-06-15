
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { useTransactionsFinancieresAujourdhui } from "@/hooks/useTransactionsFinancieresAujourdhui";
import { useCashRegisterBalance } from "@/hooks/useCashRegisterBalance";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import TransactionsOverviewTable from "./TransactionsOverviewTable";

const CashRegisterOverview: React.FC = () => {
  const { toast } = useToast();
  
  // Caisse principale
  const { data: cashRegisters } = useCashRegisters();
  const principalRegister = React.useMemo(
    () => cashRegisters?.[0],
    [cashRegisters]
  );

  // Solde calculé automatiquement
  const { data: calculatedBalance = 0 } = useCashRegisterBalance(principalRegister?.id);

  // Transactions financières du jour (incluant maintenant les ventes)
  const { data: transactionsFinancieresAujourdhui = [] } = useTransactionsFinancieresAujourdhui();

  // Calculer les totaux du jour à partir des nouvelles données
  const totals = React.useMemo(() => {
    const income = transactionsFinancieresAujourdhui
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + (t.montant || t.amount || 0), 0);
    
    const expense = transactionsFinancieresAujourdhui
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + (t.montant || t.amount || 0), 0);

    return { income, expense, balance: income - expense };
  }, [transactionsFinancieresAujourdhui]);

  // Nb transactions
  const nbIncome = transactionsFinancieresAujourdhui.filter(t => t.type === "income").length;
  const nbExpense = transactionsFinancieresAujourdhui.filter(t => t.type === "expense").length;
  const nbTotal = transactionsFinancieresAujourdhui.length;

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
            <p className="text-3xl font-bold">{formatCurrency(calculatedBalance)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Dernière mise à jour: {lastUpdate}
            </p>
          </CardContent>
        </Card>
        {/* Entrées du jour */}
        <Card>
          <CardHeader>
            <CardTitle>Entrées du jour</CardTitle>
            <CardDescription>Total des recettes (ventes incluses)</CardDescription>
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
            <p className={`text-3xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.balance)}
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
