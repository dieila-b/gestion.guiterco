
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ChevronDown, ChevronUp, Edit, Printer, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import ArticleCountCell from '@/components/sales/table/ArticleCountCell';
import EditFactureDialog from '@/components/sales/actions/EditFactureDialog';
import { printFactureVente, printTicket } from '@/components/sales/actions/print';
import type { FactureVente } from '@/types/sales';

interface UnpaidInvoicesTableProps {
  filteredFactures: FactureVente[];
  searchFacture: string;
  onSearchFactureChange: (search: string) => void;
}

type SortField = 'date_facture' | 'client' | 'montant_restant' | 'numero_facture';
type SortDirection = 'asc' | 'desc';

const UnpaidInvoicesTable: React.FC<UnpaidInvoicesTableProps> = ({
  filteredFactures,
  searchFacture,
  onSearchFactureChange,
}) => {
  const [sortField, setSortField] = useState<SortField>('date_facture');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFactures = useMemo(() => {
    return [...filteredFactures].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date_facture':
          aValue = new Date(a.date_facture);
          bValue = new Date(b.date_facture);
          break;
        case 'client':
          aValue = a.client?.nom || '';
          bValue = b.client?.nom || '';
          break;
        case 'montant_restant':
          const aMontantPaye = (a.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
          const bMontantPaye = (b.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
          aValue = (a.montant_ttc || 0) - aMontantPaye;
          bValue = (b.montant_ttc || 0) - bMontantPaye;
          break;
        case 'numero_facture':
          aValue = a.numero_facture || '';
          bValue = b.numero_facture || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredFactures, sortField, sortDirection]);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  const getPaymentStatusBadge = (statut: string | undefined) => {
    switch (statut) {
      case 'en_attente':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">En attente</span>;
      case 'partiellement_payee':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Partiel</span>;
      case 'en_retard':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">En retard</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Impayé</span>;
    }
  };

  const getDeliveryStatusBadge = (statut: string | undefined) => {
    switch (statut) {
      case 'livree':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Livrée</span>;
      case 'partiellement_livree':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Partielle</span>;
      case 'en_attente':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">En attente</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Non défini</span>;
    }
  };

  const handlePrintFacture = (facture: FactureVente) => {
    printFactureVente(facture);
  };

  const handlePrintTicket = (facture: FactureVente) => {
    printTicket(facture);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-xl font-semibold">Factures Impayées</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchFacture}
                onChange={(e) => onSearchFactureChange(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <SortableHeader field="numero_facture">N° Facture</SortableHeader>
                <SortableHeader field="date_facture">Date</SortableHeader>
                <SortableHeader field="client">Client</SortableHeader>
                <TableHead>Articles</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Payé</TableHead>
                <SortableHeader field="montant_restant">
                  <span className="text-right block">Restant</span>
                </SortableHeader>
                <TableHead>Paiement</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFactures.length > 0 ? sortedFactures.map(facture => {
                const montantPaye = (facture.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
                const montantRestant = (facture.montant_ttc || 0) - montantPaye;

                return (
                  <TableRow key={facture.id} className="hover:bg-muted/25">
                    <TableCell className="font-medium">
                      {facture.numero_facture || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(facture.date_facture), "dd/MM/yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {facture.client?.nom || 'Client non spécifié'}
                    </TableCell>
                    <TableCell>
                      <ArticleCountCell facture={facture} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(facture.montant_ttc || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(montantPaye)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {formatCurrency(montantRestant)}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(facture.statut_paiement)}
                    </TableCell>
                    <TableCell>
                      {getDeliveryStatusBadge(facture.statut_livraison)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <EditFactureDialog facture={facture} />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePrintFacture(facture)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePrintTicket(facture)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-12 w-12 text-muted-foreground/50" />
                      <span className="text-lg font-medium">Aucune facture trouvée</span>
                      <span className="text-sm">Aucune facture impayée ne correspond à vos critères de recherche</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {sortedFactures.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Afficher</span>
              <select className="border rounded px-2 py-1 bg-background">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>par page</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" disabled>
                Previous
              </Button>
              <span>Page 1 sur 1</span>
              <Button variant="ghost" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnpaidInvoicesTable;
