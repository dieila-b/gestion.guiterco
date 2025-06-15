
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { useCashOperations } from "@/hooks/useCashOperations";
import { useExpenses } from "@/hooks/useExpenses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";

// Pour les ventes : factures validées (= statut_paiement 'reglee' ou similaire)
function useValidatedSales(year: number, month: number) {
  return useQuery({
    queryKey: ["validated-sales", year, month],
    queryFn: async () => {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const { data, error } = await supabase
        .from("factures_vente")
        .select("id, date_facture, montant_ttc, statut_paiement, observations")
        .gte("date_facture", start.toISOString())
        .lte("date_facture", end.toISOString())
        .in("statut_paiement", ["reglee", "payee"]);
      if (error) throw error;
      return data || [];
    },
  });
}

const TABLE_TYPES = {
  sale: { label: "Vente", color: "text-green-700", bg: "bg-green-50" },
  income: { label: "Entrée", color: "text-green-700", bg: "bg-green-50" },
  expense: { label: "Sortie", color: "text-red-700", bg: "bg-red-50" }
}

interface AllTx {
  id: string;
  date: string;
  type: "sale" | "income" | "expense";
  montant: number;
  commentaire: string;
}

const TransactionsOverviewTable: React.FC = () => {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1);

  // Ventes validées
  const { data: sales = [], isLoading: loadingSales } = useValidatedSales(year, month);
  // Entrées/sorties manuelles
  const { data: cashOps = [], isLoading: loadingCash } = useCashOperations(year, month);
  // Sorties/dépenses
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();

  // Filtrer les dépenses sur le mois/année sélectionnés côté client (DB déjà optimisée pour les autres)
  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((exp: any) => {
      const d = new Date(exp.date_sortie);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [expenses, year, month]);

  // Agréger toutes les opérations
  const allRows: AllTx[] = [
    ...sales.map((v: any) => ({
      id: v.id,
      date: v.date_facture,
      type: "sale",
      montant: v.montant_ttc,
      commentaire: v.observations ?? "-"
    })),
    ...cashOps
      .filter((co: any) => co.type === "depot")
      .map((co: any) => ({
        id: co.id,
        date: co.created_at,
        type: "income",
        montant: co.montant,
        commentaire: co.commentaire ?? "-"
      })),
    ...cashOps
      .filter((co: any) => co.type === "retrait")
      .map((co: any) => ({
        id: co.id,
        date: co.created_at,
        type: "expense",
        montant: co.montant,
        commentaire: co.commentaire ?? "-"
      })),
    ...filteredExpenses.map((exp: any) => ({
      id: exp.id,
      date: exp.date_sortie,
      type: "expense",
      montant: exp.montant,
      commentaire: exp.description ?? "-"
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
  ];

  function handlePrint() {
    window.print(); // Placeholder, à améliorer selon besoins
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
                  <th className="py-2 px-3">Commentaire</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {(loadingSales || loadingCash || loadingExpenses) ? (
                  <tr><td colSpan={5} className="py-8 text-center text-zinc-400">Chargement…</td></tr>
                ) : (
                  allRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400">
                        Aucune opération ce mois.
                      </td>
                    </tr>
                  ) : (
                    allRows.map(row => (
                      <tr key={row.id} className="border-b last:border-b-0">
                        <td className="py-2 px-3">{format(new Date(row.date), "dd/MM/yyyy HH:mm")}</td>
                        <td className="py-2 px-3 font-medium">
                          <span className={`px-2 py-0.5 rounded ${TABLE_TYPES[row.type].bg} ${TABLE_TYPES[row.type].color}`}>
                            {TABLE_TYPES[row.type].label}
                          </span>
                        </td>
                        <td className={`py-2 px-3 font-bold ${row.type === "expense" ? "text-red-600" : "text-green-600"}`}>
                          {row.type === "expense" ? "-" : "+"}{formatCurrency(row.montant)}
                        </td>
                        <td className="py-2 px-3">{row.commentaire}</td>
                        <td className="py-2 px-3">
                          {/* Placeholder pour action future */}
                        </td>
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
