
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Client {
  id: string;
  nom: string | undefined;
}

interface DateRange {
  start?: Date;
  end?: Date;
}

interface UnpaidInvoicesFiltersProps {
  clients: Client[];
  selectedClientId: string | undefined;
  onClientSelect: (id: string | undefined) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  searchFacture: string;
  onSearchFactureChange: (search: string) => void;
}

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

const UnpaidInvoicesFilters: React.FC<UnpaidInvoicesFiltersProps> = ({
  clients,
  selectedClientId,
  onClientSelect,
  dateRange,
  onDateRangeChange,
  searchFacture,
  onSearchFactureChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      <div className="md:w-1/2">
        <label className="text-sm font-semibold mb-1 block">Filtrer par client</label>
        <ClientAutocomplete
          clients={clients}
          selectedClientId={selectedClientId}
          onSelect={onClientSelect}
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
                onDateRangeChange({
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
  );
};

export default UnpaidInvoicesFilters;
