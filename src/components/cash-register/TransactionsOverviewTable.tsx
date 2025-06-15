
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { useAllFinancialTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/currency";

const getTransactionTypeDetails = (source: string | null, type: 'income' | 'expense') => {
  switch (source) {
    case 'Vente':
    case 'Vente réglée':
    case 'Vente encaissée':
      return { label: 'Vente', className: 'bg-green-50 text-green-700' };
    case 'Paiement d’un impayé':
      return { label: 'Règlement Impayés', className: 'bg-orange-50 text-orange-700' };
    case 'Entrée manuelle':
       return { label: 'Entrée', className: 'bg-blue-50 text-blue-700' };
    case 'Sortie':
    case 'Sortie manuelle':
       return { label: 'Sortie', className: 'bg-red-50 text-red-700' };
    default:
      if (type === 'expense') {
        return { label: 'Sortie', className: 'bg-red-50 text-red-700' };
      }
      // Pour les transactions "income" sans source spécifique, on les affiche comme Vente par défaut
      if (source === 'transactions' && type === 'income') {
        return { label: 'Vente', className: 'bg-green-50 text-green-700' };
      }
      return { label: 'Entrée', className: 'bg-blue-50 text-blue-700' };
  }
};

const TransactionsOverviewTable: React.FC = () => {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1);

  // Utiliser le hook unifié pour toutes les transactions
  const { data: allTransactions = [], isLoading } = useAllFinancialTransactions();

  // Filtrer par mois/année (côté client pour ce hook qui récupère déjà les données du jour)
  const filteredTransactions = React.useMemo(() => {
    if (month !== today.getMonth() + 1 || year !== today.getFullYear()) {
      // Si on change de mois/année, on devrait faire un appel API différent
      // Pour l'instant, on retourne un tableau vide
      return [];
    }
    return allTransactions;
  }, [allTransactions, month, year, today]);

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
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
                <SelectTrigger className="w-28"><SelectValue>Mois</SelectValue></SelectTrigger>
                <SelectContent>
                  {months.map((nom, idx) => (
                    <SelectItem key={idx + 1} value={String(idx + 1)}>{nom}</SelectItem>
                  ))}
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
                        Aucune transaction aujourd'hui.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(transaction => {
                      const { label, className } = getTransactionTypeDetails(transaction.source, transaction.type);
                      return (
                        <tr key={`${transaction.source}-${transaction.id}`} className="border-b last:border-b-0">
                          <td className="py-2 px-3">{format(new Date(transaction.date), "dd/MM/yyyy HH:mm")}</td>
                          <td className="py-2 px-3 font-medium">
                            <span className={`px-2 py-0.5 rounded ${className}`}>
                              {label}
                            </span>
                          </td>
                          <td className={`py-2 px-3 font-bold ${
                            transaction.type === "expense" ? "text-red-600" : "text-green-600"
                          }`}>
                            {transaction.type === "expense" ? "-" : "+"}{formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-2 px-3">{transaction.description}</td>
                          <td className="py-2 px-1 w-16 text-center text-xs text-gray-500">
                            {transaction.source}
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
