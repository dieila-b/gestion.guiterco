
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Client } from "@/types/sales";

interface ClientPeriodFilterProps {
  clients: Client[];
  selectedClientId: string | undefined;
  onClientChange: (clientId: string | undefined) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

const ClientPeriodFilter: React.FC<ClientPeriodFilterProps> = ({
  clients,
  selectedClientId,
  onClientChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  const [query, setQuery] = useState("");
  const filteredClients = clients.filter(c =>
    c.nom.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4">
      <div className="w-full max-w-xs">
        <label className="block mb-1 font-medium">Client</label>
        <div className="relative">
          <Input
            placeholder="Recherchez un client..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        </div>
        <div className="mt-2">
          <select
            className="w-full px-2 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring"
            value={selectedClientId || ""}
            onChange={e => onClientChange(e.target.value || undefined)}
          >
            <option value="">Tous les clients</option>
            {filteredClients.map(client => (
              <option key={client.id} value={client.id}>
                {client.nom}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium">Date de début</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-[175px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="block mb-1 font-medium">Date de fin</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-[175px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ClientPeriodFilter;
