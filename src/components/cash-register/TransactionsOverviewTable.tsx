
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { useAllFinancialTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/currency";
import { getTransactionTypeDetails } from "./utils/transactionTypeUtils";

const TransactionsOverviewTable: React.FC = () => {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1);
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  // Utiliser le hook unifié pour toutes les transactions
  const { data: allTransactions = [], isLoading } = useAllFinancialTransactions();

  // Filtrer par mois/année et par type (côté client pour ce hook qui récupère déjà les données du jour)
  const filteredTransactions = React.useMemo(() => {
    if (month !== today.getMonth() + 1 || year !== today.getFullYear()) {
      // Si on change de mois/année, on devrait faire un appel API différent
      // Pour l'instant, on retourne un tableau vide
      return [];
    }

    // Filtrer par type de transaction
    if (typeFilter === "all") {
      return allTransactions;
    }

    return allTransactions.filter(transaction => {
      const { label } = getTransactionTypeDetails(transaction.source, transaction.type, transaction.description);
      
      if (typeFilter === "ventes") {
        return label === "Vente";
      }
      
      if (typeFilter === "reglements") {
        return label === "Règlement Facture" || label === "Règlement Preco";
      }
      
      if (typeFilter === "income") {
        return transaction.type === "income";
      }
      
      if (typeFilter === "expense") {
        return transaction.type === "expense";
      }

      return true;
    });
  }, [allTransactions, month, year, today, typeFilter]);

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - i);
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  function handlePrint() {
    window.print();
  }

  return (
    <Card className="mt-6">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1 gap-2">
            <h2 className="font-semibold text-xl ml-1 mb-1">Historique des transactions</h2>
            <div className="flex gap-2 items-center ml-1">
              <Select value={String(year)} onValueChange={y => setYear(Number(y))}>
                <SelectTrigger className="w-24"><SelectValue>Année</SelectValue></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(month)} onValueChange={m => setMonth(Number(m))}>
                <SelectTrigger className="w-32"><SelectValue>Mois</SelectValue></SelectTrigger>
                <SelectContent>
                  {months.map((nom, idx) => (
                    <SelectItem key={idx + 1} value={String(idx + 1)}>{nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40"><SelectValue>Type</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="ventes">Ventes</SelectItem>
                  <SelectItem value="reglements">Règlements</SelectItem>
                  <SelectItem value="income">Entrées</SelectItem>
                  <SelectItem value="expense">Sorties</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="flex items-center gap-2 ml-auto md:ml-0" onClick={handlePrint}>
              <Printer className="mr-2" />
              Imprimer
            </Button>
          </div>
          <div className="mt-2 overflow-x-auto rounded-lg border bg-background min-h-[180px]">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Montant</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-1 w-16 text-center">Source</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-zinc-400">Chargement…</td></tr>
                ) : (
                  filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400">
                        Aucune transaction trouvée pour les critères sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(transaction => {
                      const { label, className, textColor, sourceDisplay } = getTransactionTypeDetails(transaction.source, transaction.type, transaction.description);
                      
                      console.log('🎯 Transaction overview affichée:', {
                        id: transaction.id,
                        description: transaction.description,
                        source: transaction.source,
                        type: transaction.type,
                        label: label,
                        isReglement: label === "Règlement Preco"
                      });
                      
                      return (
                        <tr key={`${transaction.source}-${transaction.id}`} className="border-b last:border-b-0">
                          <td className="py-2 px-3">{format(new Date(transaction.date), "dd/MM/yyyy HH:mm")}</td>
                          <td className="py-2 px-3 font-medium">
                            <span className={`px-2 py-0.5 rounded ${className}`}>
                              {label}
                            </span>
                          </td>
                          <td className={`py-2 px-3 font-bold ${textColor}`}>
                            {transaction.type === "expense" ? "-" : "+"}
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-2 px-3">{transaction.description}</td>
                          <td className="py-2 px-1 w-16 text-center text-xs text-gray-500">
                            {sourceDisplay || transaction.source}
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsOverviewTable;
