
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useTransactionsFinancieres } from "@/hooks/useTransactionsFinancieres";
import { useCategoriesFinancieres } from "@/hooks/useCategoriesFinancieres";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CreateSortieDialog from "./dialogs/CreateSortieDialog";
import CreateEntreeDialog from "./dialogs/CreateEntreeDialog";
import CreateCategorieDialog from "./dialogs/CreateCategorieDialog";

const ExpensesTab: React.FC = () => {
  const [subTab, setSubTab] = React.useState("sorties");
  
  // Charger les données selon l'onglet actif
  const { data: sorties = [], isLoading: isLoadingSorties } = useTransactionsFinancieres('expense');
  const { data: entrees = [], isLoading: isLoadingEntrees } = useTransactionsFinancieres('income');
  const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesFinancieres();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Tabs value={subTab} onValueChange={setSubTab}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <TabsList>
            <TabsTrigger value="sorties">Sorties</TabsTrigger>
            <TabsTrigger value="entrees">Entrées</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
            {subTab === "sorties" && (
              <>
                <CreateSortieDialog />
                <Button variant="outline" className="rounded-md flex items-center" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer
                </Button>
              </>
            )}
            {subTab === "entrees" && (
              <>
                <CreateEntreeDialog />
                <Button variant="outline" className="rounded-md flex items-center" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer
                </Button>
              </>
            )}
            {subTab === "categories" && (
              <CreateCategorieDialog />
            )}
          </div>
        </div>

        <TabsContent value="sorties">
          <div className="bg-background rounded-lg shadow border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Commentaire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingSorties ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-zinc-400">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : sorties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-zinc-400">
                      Aucune sortie enregistrée.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorties.map((sortie) => (
                    <TableRow key={sortie.id}>
                      <TableCell>
                        {format(new Date(sortie.date_operation), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>{sortie.description}</TableCell>
                      <TableCell>
                        {sortie.categorie ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm"
                            style={{
                              backgroundColor: sortie.categorie.couleur,
                              color: "#fff",
                            }}
                          >
                            {sortie.categorie.nom}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Non catégorisé</span>
                        )}
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        -{formatCurrency(sortie.montant || sortie.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {sortie.commentaire || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="entrees">
          <div className="bg-background rounded-lg shadow border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Commentaire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingEntrees ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-zinc-400">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : entrees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-zinc-400">
                      Aucune entrée enregistrée.
                    </TableCell>
                  </TableRow>
                ) : (
                  entrees.map((entree) => (
                    <TableRow key={entree.id}>
                      <TableCell>
                        {format(new Date(entree.date_operation), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>{entree.description}</TableCell>
                      <TableCell>
                        {entree.categorie ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm"
                            style={{
                              backgroundColor: entree.categorie.couleur,
                              color: "#fff",
                            }}
                          >
                            {entree.categorie.nom}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Non catégorisé</span>
                        )}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        +{formatCurrency(entree.montant || entree.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {entree.commentaire || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="bg-background rounded-lg shadow border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Couleur</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCategories ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-zinc-400">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-zinc-400">
                      Aucune catégorie enregistrée.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((categorie) => (
                    <TableRow key={categorie.id}>
                      <TableCell className="font-medium">{categorie.nom}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm ${
                          categorie.type === 'entree' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {categorie.type === 'entree' ? 'Entrée' : 'Sortie'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: categorie.couleur }}
                          />
                          {categorie.couleur}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {categorie.description || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpensesTab;
