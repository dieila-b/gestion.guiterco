
import React, { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useOptimizedCashRegisters } from "@/hooks/useOptimizedCashRegisters";
import { useAddCashOperation } from "@/hooks/useCashOperations";
import { formatCurrency } from "@/lib/currency";
import { Printer } from "lucide-react";
import { OptimizedLoading, TableSkeleton } from "@/components/ui/optimized-loading";

const OptimizedCaissesTab: React.FC = () => {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1);
  
  const {
    fetchCashOperations,
    getCashOperations,
    isLoadingOperations
  } = useOptimizedCashRegisters();

  // Formulaire
  const [type, setType] = React.useState<"retrait" | "depot">("depot");
  const [montant, setMontant] = React.useState("");
  const [commentaire, setCommentaire] = React.useState("");
  const { mutate: addOperation, isPending } = useAddCashOperation();
  const { toast } = useToast();

  // Charger les opérations
  useEffect(() => {
    fetchCashOperations(year, month).catch(error => {
      console.error('Erreur chargement opérations:', error);
    });
  }, [year, month, fetchCashOperations]);

  const ops = getCashOperations(year, month);
  const isLoading = isLoadingOperations(year, month);

  // Calculs optimisés avec memoization
  const { fondDeCaisse, encaissementJour } = useMemo(() => {
    if (!ops.length) return { fondDeCaisse: 0, encaissementJour: 0 };

    let fond = 0;
    let encaissement = 0;
    const todayStr = today.toDateString();

    ops.slice().reverse().forEach((op) => {
      if (op.type === "depot") fond += op.montant;
      else if (op.type === "retrait") fond -= op.montant;

      if (new Date(op.created_at).toDateString() === todayStr && op.type === "depot") {
        encaissement += op.montant;
      }
    });

    return { fondDeCaisse: fond, encaissementJour: encaissement };
  }, [ops, today]);

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
  ];

  function handleSave() {
    const num = parseInt(montant);
    if (!num || num < 1) {
      toast({ title: "Erreur", description: "Montant invalide", variant: "destructive" });
      return;
    }
    
    addOperation(
      { type, montant: num, commentaire: commentaire || undefined },
      {
        onSuccess: () => {
          toast({
            title: "Opération enregistrée",
            description: `Votre opération de caisse a été ajoutée.`,
          });
          setMontant("");
          setCommentaire("");
          // Rafraîchir les données
          fetchCashOperations(year, month);
        },
        onError: () =>
          toast({
            title: "Erreur",
            description: "Impossible d'enregistrer l'opération",
            variant: "destructive",
          }),
      }
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 bg-blue-50 border-blue-400">
          <CardContent className="py-6 flex flex-col items-center">
            <div className="text-md font-medium text-blue-800 mb-2">Fond de caisse actuel</div>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(fondDeCaisse)}</div>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-orange-50 border-orange-400">
          <CardContent className="py-6 flex flex-col items-center">
            <div className="text-md font-medium text-orange-800 mb-2">Encaissement du jour</div>
            <div className="text-3xl font-bold text-orange-600">{formatCurrency(encaissementJour)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Module Retrait/Dépôt */}
      <div className="bg-background p-6 rounded-xl border shadow-sm mb-6 flex flex-col md:flex-row items-end gap-4">
        <div className="w-44">
          <Select value={type} onValueChange={v => setType(v as "retrait" | "depot")}>
            <SelectTrigger>
              <SelectValue>{type === "depot" ? "Dépôt" : "Retrait"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="depot">Dépôt</SelectItem>
              <SelectItem value="retrait">Retrait</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          type="number"
          value={montant}
          onChange={e => setMontant(e.target.value)}
          placeholder="Montant"
          className="w-32"
          min={1}
        />
        <Input
          type="text"
          value={commentaire}
          onChange={e => setCommentaire(e.target.value)}
          placeholder="Commentaires"
          className="flex-1"
        />
        <Button
          disabled={isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={handleSave}
        >
          {isPending ? <OptimizedLoading type="inline" text="Enregistrement..." /> : "Sauvegarder"}
        </Button>
      </div>

      {/* Historique des transactions */}
      <div className="bg-background p-6 rounded-xl border shadow-sm">
        <h2 className="font-semibold text-lg mb-6">Historique des transactions</h2>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <div className="flex gap-2">
            <Select value={String(year)} onValueChange={(y) => setYear(Number(y))}>
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
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center rounded-md">
              <Printer className="mr-2" />
              Imprimer
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
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
                {ops.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-400">
                      Aucune opération ce mois.
                    </td>
                  </tr>
                ) : (
                  ops.map((op) => (
                    <tr key={op.id} className="border-b last:border-b-0">
                      <td className="py-2 px-3">{new Date(op.created_at).toLocaleString("fr-FR")}</td>
                      <td className="py-2 px-3">
                        <span className={
                          op.type === "depot"
                            ? "bg-green-100 text-green-700 px-2 py-0.5 rounded"
                            : "bg-orange-100 text-orange-700 px-2 py-0.5 rounded"
                        }>
                          {op.type === "depot" ? "Dépôt" : "Retrait"}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold">{formatCurrency(op.montant)}</td>
                      <td className="py-2 px-3">{op.commentaire ?? <span className="opacity-60 italic">—</span>}</td>
                      <td className="py-2 px-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                        >
                          Valider
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizedCaissesTab;
