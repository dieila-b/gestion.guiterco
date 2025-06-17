
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Transaction } from './types';

interface TransactionsHistoryProps {
  transactions: (Transaction & { source?: string | null })[];
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  formatCurrency: (amount: number) => string;
}

const getTransactionTypeDetails = (source: string | null, type: 'income' | 'expense') => {
  // Logique conditionnelle exacte demandée par l'utilisateur
  if (source === "facture") {
    return {
      label: "Règlement",
      className: "bg-orange-50 text-orange-700",
      textColor: "text-orange-700",
      sourceDisplay: "Règlement facture"
    };
  }

  // Pour toutes les autres transactions, c'est une vente (si income) ou autre
  if (type === 'income') {
    return {
      label: "Vente",
      className: "bg-green-50 text-green-700",
      textColor: "text-green-700",
      sourceDisplay: "vente"
    };
  }

  // Gestion des autres types (entrées manuelles, sorties, etc.)
  const normalizedSource = source?.trim().toLowerCase();
  
  switch (normalizedSource) {
    case 'entrée manuelle':
      return {
        label: 'Entrée',
        className: 'bg-blue-50 text-blue-700',
        textColor: "text-blue-700",
        sourceDisplay: source
      };
    case 'sortie':
    case 'sortie manuelle':
      return {
        label: 'Sortie',
        className: 'bg-red-50 text-red-700',
        textColor: "text-red-700",
        sourceDisplay: source
      };
    default:
      // Logique de fallback
      if (type === 'expense') {
        return { 
          label: 'Sortie', 
          className: 'bg-red-50 text-red-700', 
          textColor: "text-red-700",
          sourceDisplay: source 
        };
      }
      return { 
        label: 'Entrée', 
        className: 'bg-blue-50 text-blue-700', 
        textColor: "text-blue-700",
        sourceDisplay: source 
      };
  }
};

const TransactionsHistory: React.FC<TransactionsHistoryProps> = ({
  transactions,
  date,
  setDate,
  formatCurrency
}) => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filtrer les transactions selon le type sélectionné et le terme de recherche
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === "" || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());

    if (typeFilter === "all") {
      return matchesSearch;
    }

    const { label } = getTransactionTypeDetails(transaction.source, transaction.type);
    
    if (typeFilter === "ventes") {
      return matchesSearch && label === "Vente";
    }
    
    if (typeFilter === "reglements") {
      return matchesSearch && label === "Règlement";
    }
    
    if (typeFilter === "income") {
      return matchesSearch && transaction.type === "income";
    }
    
    if (typeFilter === "expense") {
      return matchesSearch && transaction.type === "expense";
    }

    return matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
        <CardDescription>Toutes les entrées et sorties de caisse</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Recherche</Label>
              <Input 
                id="search" 
                placeholder="Rechercher une transaction..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les transactions</SelectItem>
                <SelectItem value="ventes">Ventes uniquement</SelectItem>
                <SelectItem value="reglements">Règlements uniquement</SelectItem>
                <SelectItem value="income">Toutes les entrées</SelectItem>
                <SelectItem value="expense">Toutes les sorties</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd/MM/yyyy') : <span>Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b bg-muted/50">
              <div>Description</div>
              <div>Type</div>
              <div>Date</div>
              <div className="text-right">Montant</div>
            </div>
            <div className="divide-y">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Aucune transaction trouvée pour les critères sélectionnés
                </div>
              ) : (
                filteredTransactions.map((transaction) => {
                  const { label, className, textColor } = getTransactionTypeDetails(transaction.source, transaction.type);
                  return (
                    <div key={transaction.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.category}</p>
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
                          {label}
                        </span>
                      </div>
                      <div>
                        {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                      <div className={`text-right font-medium ${textColor}`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsHistory;
