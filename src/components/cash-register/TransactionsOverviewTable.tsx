
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { useAllFinancialTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/currency";

const getTransactionTypeDetails = (source: string | null, type: 'income' | 'expense') => {
  // Normaliser la source pour éviter les problèmes de casse et d'espaces
  const normalizedSource = source?.trim().toLowerCase();
  
  switch (normalizedSource) {
    case 'vente':
    case 'vente réglée':
    case 'vente encaissée':
      return { label: 'Vente', className: 'bg-green-50 text-green-700' };
    case 'paiement d\'un impayé':
    case 'règlement impayés':
    case 'paiement impayé':
    case 'règlement facture':
      return { label: 'Règlement Facture', className: 'bg-orange-50 text-orange-700' };
    case 'entrée manuelle':
      return { label: 'Entrée', className: 'bg-blue-50 text-blue-700' };
    case 'sortie':
    case 'sortie manuelle':
      return { label: 'Sortie', className: 'bg-red-50 text-red-700' };
    default:
      // Fallback logic améliorée
      if (type === 'expense') {
        return { label: 'Sortie', className: 'bg-red-50 text-red-700' };
      }
      // Pour les transactions income sans source claire, on essaie de deviner depuis la source originale
      if (source === 'transactions' || !source) {
        return { label: 'Vente', className: 'bg-green-50 text-green-700' };
      }
      return { label: 'Entrée', className: 'bg-blue-50 text-blue-700' };
  }
};

const TransactionsOverviewTable: React.FC = () => {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1);
  const [customYear, setCustomYear] = React.useState("");

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

  // Générer les années (5 dernières années + années futures jusqu'à +2)
  const years = Array.from({ length: 8 }, (_, i) => today.getFullYear() - 5 + i);
  
  const months = [
    { value: 1, label: "Janvier" },
    { value: 2, label: "Février" },
    { value: 3, label: "Mars" },
    { value: 4, label: "Avril" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" },
    { value: 8, label: "Août" },
    { value: 9, label: "Septembre" },
    { value: 10, label: "Octobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Décembre" }
  ];

  const handleCustomYearSubmit = () => {
    const yearValue = parseInt(customYear);
    if (!isNaN(yearValue) && yearValue >= 2000 && yearValue <= 2050) {
      setYear(yearValue);
      setCustomYear("");
    }
  };

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
              <div className="flex gap-1 items-center">
                <Select value={String(year)} onValueChange={y => setYear(Number(y))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Input
                    placeholder="Année"
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    className="w-20"
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomYearSubmit()}
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCustomYearSubmit}
                    disabled={!customYear}
                  >
                    OK
                  </Button>
                </div>
              </div>
              <Select value={String(month)} onValueChange={m => setMonth(Number(m))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
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
                        Aucune transaction pour {months.find(m => m.value === month)?.label} {year}.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(transaction => {
                      const { label, className } = getTransactionTypeDetails(transaction.source, transaction.type);
                      const isReglement = transaction.source?.toLowerCase().includes('règlement') || 
                                         transaction.source?.toLowerCase().includes('paiement') ||
                                         transaction.source?.toLowerCase().includes('impayé');
                      const textColor = isReglement ? "text-orange-600" : 
                                       transaction.type === "expense" ? "text-red-600" : "text-green-600";
                      
                      return (
                        <tr key={`${transaction.source}-${transaction.id}`} className="border-b last:border-b-0">
                          <td className="py-2 px-3">{format(new Date(transaction.date), "dd/MM/yyyy HH:mm")}</td>
                          <td className="py-2 px-3 font-medium">
                            <span className={`px-2 py-0.5 rounded ${className}`}>
                              {label}
                            </span>
                          </td>
                          <td className={`py-2 px-3 font-bold ${textColor}`}>
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
