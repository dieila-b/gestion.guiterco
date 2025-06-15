
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { useCashOperations } from "@/hooks/useCashOperations";
import { useExpenses } from "@/hooks/useExpenses";
import { useTransactionsFinancieres } from "@/hooks/useTransactionsFinancieres";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";

const TABLE_TYPES = {
  income: { label: "Entrée", color: "text-green-700", bg: "bg-green-50" },
  expense: { label: "Sortie", color: "text-red-700", bg: "bg-red-50" }
}

interface AllTx {
  id: string;
  date: string;
  type: "income" | "expense";
  montant: number;
  commentaire: string;
}

const TransactionsOverviewTable: React.FC = () => {
  const { toast } = useToast();
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1);

  // Transactions financières du mois sélectionné
  const { data: transactionsFinancieres = [], isLoading: loadingTransactions } = useTransactionsFinancieres(undefined, year, month);
  
  // Entrées/sorties manuelles
  const { data: cashOps = [], isLoading: loadingCash } = useCashOperations(year, month);
  
  // Sorties/dépenses
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();

  // Filtrer les dépenses sur le mois/année sélectionnés côté client
  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((exp: any) => {
      const d = new Date(exp.date_sortie);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [expenses, year, month]);

  // Agréger toutes les opérations avec typage strict
  const allRows: AllTx[] = React.useMemo(() => {
    const rows: AllTx[] = [];
    
    // Ajouter les transactions financières
    transactionsFinancieres.forEach((tf: any) => {
      rows.push({
        id: tf.id,
        date: tf.date_operation || tf.created_at,
        type: tf.type,
        montant: tf.montant || tf.amount || 0,
        commentaire: tf.commentaire || tf.description || "-"
      });
    });
    
    // Ajouter les opérations de caisse (dépôts/retraits)
    cashOps.forEach((co: any) => {
      rows.push({
        id: co.id,
        date: co.created_at,
        type: co.type === "depot" ? "income" : "expense",
        montant: co.montant,
        commentaire: co.commentaire || "-"
      });
    });
    
    // Ajouter les dépenses filtrées
    filteredExpenses.forEach((exp: any) => {
      rows.push({
        id: exp.id,
        date: exp.date_sortie,
        type: "expense",
        montant: exp.montant,
        commentaire: exp.description || "-"
      });
    });
    
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactionsFinancieres, cashOps, filteredExpenses]);

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
  ];

  function handlePrint() {
    toast({
      title: "Impression",
      description: "Fonction d'impression en cours de développement",
    });
  }

  return (
    <Card className="mt-6">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1 gap-2">
            <h2 className="font-semibold text-xl ml-1 mb-1">Historique des transactions</h2>
            <div className="flex gap-2 items-center ml-1">
              <Select value={String(year)} onValueChange={y => setYear(Number(y))}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(month)} onValueChange={m => setMonth(Number(m))}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map((nom, idx) => (
                    <SelectItem key={idx + 1} value={String(idx + 1)}>{nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
            </div>
          </div>
          <div className="mt-2 overflow-x-auto rounded-lg border bg-background min-h-[180px]">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Type</th>
                  <th className="py-3 px-4 text-right font-medium">Montant</th>
                  <th className="py-3 px-4 text-left font-medium">Commentaire</th>
                </tr>
              </thead>
              <tbody>
                {(loadingTransactions || loadingCash || loadingExpenses) ? (
                  <tr><td colSpan={4} className="py-8 text-center text-zinc-400">Chargement…</td></tr>
                ) : (
                  allRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-400">
                        Aucune transaction pour {months[month - 1]} {year}.
                      </td>
                    </tr>
                  ) : (
                    allRows.map(row => (
                      <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/50">
                        <td className="py-3 px-4">{format(new Date(row.date), "dd/MM/yyyy HH:mm")}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${TABLE_TYPES[row.type].bg} ${TABLE_TYPES[row.type].color}`}>
                            {TABLE_TYPES[row.type].label}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${row.type === "expense" ? "text-red-600" : "text-green-600"}`}>
                          {row.type === "expense" ? "-" : "+"}{formatCurrency(row.montant)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{row.commentaire}</td>
                      </tr>
                    ))
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
