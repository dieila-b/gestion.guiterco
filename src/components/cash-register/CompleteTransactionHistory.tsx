import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useCompleteTransactionHistory } from "@/hooks/useCompleteTransactionHistory";
import { formatCurrency } from "@/lib/currency";
import CompleteHistoryStatsCards from './components/CompleteHistoryStatsCards';
import CompleteHistoryTable from './components/CompleteHistoryTable';

const CompleteTransactionHistory: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    year: currentYear,
    month: currentMonth,
    day: undefined as number | undefined,
    type: 'all' as string,
    searchTerm: ''
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Hook pour récupérer les données
  const { 
    data,
    isLoading
  } = useCompleteTransactionHistory(filters);

  // Extraire les données et statistiques de manière sécurisée
  const transactions = data?.transactions || [];
  const stats = data?.stats || {
    soldeActif: 0,
    totalEntrees: 0,
    totalSorties: 0,
    balance: 0
  };

  // Générer les années (10 dernières années)
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  // Générer les mois
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
    { value: 12, label: "Décembre" }
  ];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFilters(prev => ({
        ...prev,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        day: undefined
      }));
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearDayFilter = () => {
    setSelectedDate(undefined);
    setFilters(prev => ({
      ...prev,
      day: undefined
    }));
  };

  return (
    <div className="space-y-6">
      {/* Statistiques en haut */}
      <CompleteHistoryStatsCards stats={stats} />

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Historique complet des transactions</CardTitle>
          <CardDescription>Filtrez et recherchez dans toutes les transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Filtre Année */}
            <div className="space-y-2">
              <Label>Année (obligatoire)</Label>
              <Select value={String(filters.year)} onValueChange={(value) => handleFilterChange('year', Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Mois */}
            <div className="space-y-2">
              <Label>Mois</Label>
              <Select value={String(filters.month)} onValueChange={(value) => handleFilterChange('month', Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Jour */}
            <div className="space-y-2">
              <Label>Jour (optionnel)</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: fr }) : <span>Sélectionner</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                {selectedDate && (
                  <Button variant="outline" size="sm" onClick={clearDayFilter}>
                    ×
                  </Button>
                )}
              </div>
            </div>

            {/* Filtre Type */}
            <div className="space-y-2">
              <Label>Type de transaction</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="vente">Vente</SelectItem>
                  <SelectItem value="reglement">Règlement</SelectItem>
                  <SelectItem value="entree_manuelle">Entrée manuelle</SelectItem>
                  <SelectItem value="sortie_manuelle">Sortie manuelle</SelectItem>
                  <SelectItem value="precommande">Précommande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recherche */}
          <div className="mb-6">
            <Label htmlFor="search">Rechercher</Label>
            <Input 
              id="search"
              placeholder="Rechercher par description, source..." 
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Tableau des transactions */}
          <CompleteHistoryTable 
            transactions={transactions}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteTransactionHistory;
