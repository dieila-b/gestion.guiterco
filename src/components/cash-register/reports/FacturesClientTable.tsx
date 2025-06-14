
import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/currency";
import type { FactureVente } from "@/types/sales";

interface FacturesClientTableProps {
  factures: FactureVente[];
  clientSelected?: boolean;
}

const FacturesClientTable: React.FC<FacturesClientTableProps> = ({ factures, clientSelected }) => {
  return (
    <div className="overflow-x-auto border border-zinc-100 rounded-lg bg-white shadow dark:bg-zinc-900 dark:border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>N° Facture</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payé</TableHead>
            <TableHead>Reste</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!clientSelected ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-zinc-400">
                Veuillez sélectionner un client
              </TableCell>
            </TableRow>
          ) : factures.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-zinc-400">
                Aucune facture trouvée pour cette période.
              </TableCell>
            </TableRow>
          ) : (
            factures.map(facture => {
              const montantVerse = (facture.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
              const reste = facture.montant_ttc - montantVerse;
              const statut = 
                montantVerse >= facture.montant_ttc
                  ? "payée"
                  : montantVerse > 0
                  ? "partielle"
                  : "impayée";
              return (
                <TableRow key={facture.id}>
                  <TableCell>{format(new Date(facture.date_facture), "dd/MM/yyyy", { locale: fr })}</TableCell>
                  <TableCell>{facture.numero_facture}</TableCell>
                  <TableCell>
                    {(facture.nb_articles !== undefined && facture.nb_articles !== null)
                      ? facture.nb_articles
                      : (facture.lignes_facture?.length || 0)}
                  </TableCell>
                  <TableCell>{formatCurrency(facture.montant_ttc)}</TableCell>
                  <TableCell className="text-green-600">{formatCurrency(montantVerse)}</TableCell>
                  <TableCell className="text-orange-500">{formatCurrency(reste)}</TableCell>
                  <TableCell>
                    <span className={
                      statut === "payée"
                        ? "text-green-600 font-medium"
                        : statut === "partielle"
                        ? "text-yellow-600 font-medium"
                        : "text-red-600 font-medium"
                    }>
                      {statut}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacturesClientTable;
