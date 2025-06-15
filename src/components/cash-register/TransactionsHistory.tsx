import React from 'react';
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
  // Normaliser la source pour éviter les problèmes de casse et d'espaces
  const normalizedSource = source?.trim().toLowerCase();

  // Par défaut : tout paramètre absent = fallback cohérent
  if (!normalizedSource || normalizedSource === "transactions") {
    if (type === "income") {
      return {
        label: "Vente",
        className: "bg-green-50 text-green-700",
        textColor: "text-green-700"
      };
    } else {
      return {
        label: "Sortie",
        className: "bg-red-50 text-red-700",
        textColor: "text-red-700"
      };
    }
  }

  switch (normalizedSource) {
    case 'vente':
    case 'vente encaissée':
    case 'vente réglée':
      return {
        label: 'Vente',
        className: 'bg-green-50 text-green-700',
        textColor: "text-green-700"
      };
    case "paiement d'un impayé":
    case 'règlement impayés':
    case 'paiement impayé':
    case 'règlement facture':
      return {
        label: "Règlement Impayés",
        className: "bg-orange-50 text-orange-700",
        textColor: "text-orange-700"
      };
    case 'entrée manuelle':
      return {
        label: 'Entrée',
        className: 'bg-blue-50 text-blue-700',
        textColor: "text-blue-700"
      };
    case 'sortie':
    case 'sortie manuelle':
      return {
        label: 'Sortie',
        className: 'bg-red-50 text-red-700',
        textColor: "text-red-700"
      };
    default:
      // Logique de fallback : income bleu, expense rouge, mais on garde badge bleu pour income inconnu
      if (type === 'income') {
        return { label: 'Entrée', className: 'bg-blue-50 text-blue-700', textColor: "text-blue-700" };
      }
      return { label: 'Sortie', className: 'bg-red-50 text-red-700', textColor: "text-red-700" };
  }
};

const TransactionsHistory: React.FC<TransactionsHistoryProps> = ({
  transactions,
  date,
  setDate,
  formatCurrency
}) => {
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
              <Input id="search" placeholder="Rechercher une transaction..." />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les transactions</SelectItem>
                <SelectItem value="income">Entrées</SelectItem>
                <SelectItem value="expense">Dépenses</SelectItem>
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
              {transactions.map((transaction) => {
                const { label, className, textColor } = getTransactionTypeDetails(transaction.source, transaction.type);
                return (
                  <div key={transaction.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.category}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${className} ${textColor}`}>
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
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsHistory;
