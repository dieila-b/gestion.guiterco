
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface FactureVente {
  id: string;
  numero_facture?: string;
  date_facture: string;
  montant_ttc?: number;
  statut_paiement?: string;
  client?: {
    nom?: string;
  };
  versements?: Array<{
    montant?: number;
  }>;
}

interface UnpaidInvoicesTableProps {
  filteredFactures: FactureVente[];
  searchFacture: string;
  onSearchFactureChange: (search: string) => void;
}

const UnpaidInvoicesTable: React.FC<UnpaidInvoicesTableProps> = ({
  filteredFactures,
  searchFacture,
  onSearchFactureChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Période</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="mb-2 md:mb-0 flex-1">
            <div className="flex items-center border rounded-md px-3 py-1 bg-background">
              <Search className="mr-2 opacity-60" />
              <input
                className="bg-background outline-none flex-grow py-1"
                placeholder="Rechercher une facture..."
                value={searchFacture}
                onChange={e => onSearchFactureChange(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto border border-zinc-800 rounded-lg bg-background shadow dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>N° Facture</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payé</TableHead>
                <TableHead>Reste</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFactures.length > 0 ? filteredFactures.map(f => {
                const montantPaye = (f.versements ?? []).reduce((s, v) => s + (v.montant || 0), 0);
                const reste = (f.montant_ttc || 0) - montantPaye;
                return (
                  <TableRow key={f.id}>
                    <TableCell>
                      {f.date_facture
                        ? format(new Date(f.date_facture), "dd/MM/yyyy", { locale: fr })
                        : ""}
                    </TableCell>
                    <TableCell>
                      {f.client?.nom || 'Client non spécifié'}
                    </TableCell>
                    <TableCell>{f.numero_facture}</TableCell>
                    <TableCell>{formatCurrency(f.montant_ttc || 0)}</TableCell>
                    <TableCell>{formatCurrency(montantPaye)}</TableCell>
                    <TableCell className="font-bold text-red-600">{formatCurrency(reste)}</TableCell>
                    <TableCell>
                      {f.statut_paiement === "en_attente"
                        ? <span className="font-semibold text-orange-500">En attente</span>
                        : f.statut_paiement === "partiellement_payee"
                          ? <span className="font-semibold text-yellow-600">Partiel</span>
                          : <span className="font-semibold text-red-600">Impayé</span>
                      }
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-zinc-400 py-8">
                    Aucune facture impayée trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnpaidInvoicesTable;
