
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AdvancedTransactionFiltersProps {
  year: number;
  month: number;
  day: number | null;
  typeFilter: string;
  searchTerm: string;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onDayChange: (day: number | null) => void;
  onTypeFilterChange: (type: string) => void;
  onSearchTermChange: (term: string) => void;
  onResetFilters: () => void;
}

const AdvancedTransactionFilters: React.FC<AdvancedTransactionFiltersProps> = ({
  year,
  month,
  day,
  typeFilter,
  searchTerm,
  onYearChange,
  onMonthChange,
  onDayChange,
  onTypeFilterChange,
  onSearchTermChange,
  onResetFilters
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  const months = [
    { value: 1, label: "Janvier" },
    { value: 2, label: "Février" },
    { value: 3, label: "Mars" },
    { value: 4, label: "Avril" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" },
    { value: 8, label: "Août" },
    { value: 9, label: "Septembre" },
    { value: 10, label: "Octobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Décembre" },
  ];

  const selectedDate = day ? new Date(year, month - 1, day) : undefined;

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filtres avancés</h3>
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          <X className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtre par année */}
        <div className="space-y-2">
          <Label>Année</Label>
          <Select value={year.toString()} onValueChange={(value) => onYearChange(Number(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtre par mois */}
        <div className="space-y-2">
          <Label>Mois</Label>
          <Select value={month.toString()} onValueChange={(value) => onMonthChange(Number(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtre par jour */}
        <div className="space-y-2">
          <Label>Jour (optionnel)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => onDayChange(date ? date.getDate() : null)}
                month={new Date(year, month - 1)}
                onMonthChange={(date) => {
                  onYearChange(date.getFullYear());
                  onMonthChange(date.getMonth() + 1);
                }}
                locale={fr}
              />
              {selectedDate && (
                <div className="p-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDayChange(null)}
                    className="w-full"
                  >
                    Effacer la sélection
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Filtre par type */}
        <div className="space-y-2">
          <Label>Type de transaction</Label>
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="ventes">Ventes</SelectItem>
              <SelectItem value="reglements">Règlements</SelectItem>
              <SelectItem value="entrees">Entrées manuelles</SelectItem>
              <SelectItem value="sorties">Sorties manuelles</SelectItem>
              <SelectItem value="precommandes">Précommandes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recherche textuelle */}
      <div className="space-y-2">
        <Label>Recherche dans la description</Label>
        <Input
          type="text"
          placeholder="Rechercher dans les descriptions..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AdvancedTransactionFilters;
