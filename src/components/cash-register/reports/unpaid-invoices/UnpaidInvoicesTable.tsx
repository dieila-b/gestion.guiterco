
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody } from '@/components/ui/table';
import SearchAndActions from './components/SearchAndActions';
import UnpaidInvoicesTableHeader from './components/TableHeader';
import UnpaidInvoiceRow from './components/UnpaidInvoiceRow';
import EmptyState from './components/EmptyState';
import Pagination from './components/Pagination';
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

  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <SearchAndActions 
          searchValue={searchFacture}
          onSearchChange={onSearchFactureChange}
        />
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <UnpaidInvoicesTableHeader 
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <TableBody>
              {sortedFactures.length > 0 ? 
                sortedFactures.map(facture => (
                  <UnpaidInvoiceRow key={facture.id} facture={facture} />
                )) 
                : <EmptyState />
              }
            </TableBody>
          </Table>
        </div>
        
        <Pagination totalItems={sortedFactures.length} />
      </CardContent>
    </Card>
  );
};

export default UnpaidInvoicesTable;
