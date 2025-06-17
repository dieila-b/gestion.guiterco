
import React, { useMemo, useState } from 'react';
import { useFacturesVenteQuery, useClientsQuery } from '@/hooks/useSalesQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Download, Calendar as CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatCurrency } from '@/lib/currency';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Simple Autocomplete
const ClientAutocomplete = ({ clients, selectedClientId, onSelect }: {
  clients: Array<{ id: string, nom: string | undefined }>,
  selectedClientId: string | undefined,
  onSelect: (id: string | undefined) => void
}) => {
  const [search, setSearch] = useState('');
  const matches = clients.filter(cl =>
    !search ? true : (cl.nom?.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="w-full">
      <div className="flex items-center border rounded-md px-3 py-1 bg-background mb-2">
        <Search className="mr-2 opacity-60" />
        <input
          className="bg-background outline-none flex-grow py-1"
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="relative">
        <select
          className="w-full px-2 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring dark:bg-zinc-900"
          value={selectedClientId || ''}
          onChange={e => onSelect(e.target.value || undefined)}
        >
          <option value="">Tous les clients</option>
          {matches.map(cl => (
            <option key={cl.id} value={cl.id}>{cl.nom}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

const UnpaidInvoicesReports: React.FC = () => {
  const { data: factures = [], isLoading } = useFacturesVenteQuery();
  const { data: clients = [] } = useClientsQuery();

  // State for filters
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{start?: Date, end?: Date}>({});
  const [searchFacture, setSearchFacture] = useState('');

  // Datepicker logic
  const [open, setOpen] = useState(false);

  // Filtered unpaid invoices with remaining amount > 0
  const filteredFactures = useMemo(() => {
    let res = factures.filter(f => {
      // Calculer le montant payé pour chaque facture
      const montantPaye = (f.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
      const montantRestant = (f.montant_ttc || 0) - montantPaye;
      
      // Ne garder que les factures avec un montant restant > 0
      return montantRestant > 0;
    });

    if (selectedClientId) {
      res = res.filter(f => f.client_id === selectedClientId);
    }
    if (dateRange.start) {
      res = res.filter(f => new Date(f.date_facture) >= dateRange.start!);
    }
    if (dateRange.end) {
      res = res.filter(f => new Date(f.date_facture) <= dateRange.end!);
    }
    if (searchFacture) {
      res = res.filter(f => f.numero_facture?.toLowerCase().includes(searchFacture.toLowerCase()));
    }
    return res;
  }, [factures, selectedClientId, dateRange, searchFacture]);

  // Stats recalculées sur les factures filtrées uniquement
  const totalFacture = filteredFactures.reduce((sum, f) => sum + (f.montant_ttc || 0), 0);
  const totalPaye = filteredFactures.reduce(
    (sum, f) => sum + ((f.versements ?? []).reduce((sv, v) => sv + (v.montant || 0), 0)),
    0
  );
  const totalImpayé = totalFacture - totalPaye;

  // Export/print handlers
  const handlePrint = () => {
    window.print();
  };
  const handleExportPDF = () => {
    // TODO: Implémenter export PDF selon les filtres appliqués
    alert('Export PDF non implémenté');
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <div>
          <h2 className="text-2xl font-bold mb-1">Factures Impayées</h2>
          <div className="text-muted-foreground mb-2">Liste de toutes les factures avec un solde restant.</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2"/> Imprimer
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2"/> Exporter PDF
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          <label className="text-sm font-semibold mb-1 block">Filtrer par client</label>
          <ClientAutocomplete
            clients={clients}
            selectedClientId={selectedClientId}
            onSelect={setSelectedClientId}
          />
        </div>
        <div className="md:w-1/2">
          <label className="text-sm font-semibold mb-1 block">Période</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                aria-label="Sélectionner la période"
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                {dateRange.start && dateRange.end
                  ? `${format(dateRange.start, "dd MMM yyyy", { locale: fr })} - ${format(dateRange.end, "dd MMM yyyy", { locale: fr })}`
                  : "Sélectionner une période"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={{
                  from: dateRange.start,
                  to: dateRange.end
                }}
                onSelect={(v) =>
                  setDateRange({
                    start: v?.from ?? undefined,
                    end: v?.to ?? undefined
                  })
                }
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-4 mb-4">
        <Card className="bg-blue-50 dark:bg-blue-950 min-w-[160px]">
          <CardContent className="pt-4 pb-2 px-4">
            <div className="text-xs font-semibold text-blue-800 dark:text-blue-100 mb-1">Total facturé</div>
            <div className="text-lg font-bold">{formatCurrency(totalFacture)}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950 min-w-[160px]">
          <CardContent className="pt-4 pb-2 px-4">
            <div className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1">Total payé</div>
            <div className="text-lg font-bold">{formatCurrency(totalPaye)}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950 min-w-[160px]">
          <CardContent className="pt-4 pb-2 px-4">
            <div className="text-xs font-semibold text-red-900 dark:text-red-100 mb-1">Total impayé</div>
            <div className="text-lg font-bold">{formatCurrency(totalImpayé)}</div>
          </CardContent>
        </Card>
      </div>

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
                  onChange={e => setSearchFacture(e.target.value)}
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
    </div>
  );
};

export default UnpaidInvoicesReports;
