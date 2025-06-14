
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useExpenses } from "@/hooks/useExpenses";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ExpensesTab: React.FC = () => {
  const { data: expenses = [], isLoading } = useExpenses();
  const { data: categories = [] } = useExpenseCategories();
  const [subTab, setSubTab] = React.useState("sorties");

  // Pour version MVP : seules les sorties sont affichées
  return (
    <div className="space-y-6">
      {/* Sous-onglets */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <TabsList>
            <TabsTrigger value="sorties">Sorties</TabsTrigger>
            <TabsTrigger value="entrees" disabled>
              Entrées
            </TabsTrigger>
            <TabsTrigger value="categories" disabled>
              Catégories
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
            <Button variant="outline" className="rounded-md flex items-center">
              <Plus className="mr-2" />
              Nouvelle sortie
            </Button>
            <Button variant="outline" className="rounded-md flex items-center">
              <Printer className="mr-2" />
              Imprimer
            </Button>
          </div>
        </div>
        {/* Tab content */}
        <TabsContent value="sorties">
          <div className="bg-background rounded-lg shadow border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoading && expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-zinc-400">
                      Aucune sortie enregistrée.
                    </TableCell>
                  </TableRow>
                )}
                {expenses.map((exp: any) => (
                  <TableRow key={exp.id}>
                    <TableCell>
                      {exp.date_sortie
                        ? new Date(exp.date_sortie).toLocaleDateString("fr-FR")
                        : ""}
                    </TableCell>
                    <TableCell>{exp.description}</TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800"
                        style={{
                          backgroundColor: exp.categorie?.couleur ?? "#e0e7ff",
                          color: "#222",
                        }}
                      >
                        {exp.categorie?.nom ?? <span className="opacity-60 italic">Non assignée</span>}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(exp.montant)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpensesTab;
