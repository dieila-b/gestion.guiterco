
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
  transactions: Transaction[];
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  formatCurrency: (amount: number) => string;
}

// Fonction pour déterminer le type d'affichage selon la source
const getTransactionDisplayType = (transaction: Transaction) => {
  if (transaction.type === 'expense') return 'Sortie';
  
  // Pour les entrées, on différencie selon la source
  switch (transaction.source) {
    case 'vente':
      return 'Vente';
    case 'paiement_impaye':
    case 'reglement_impaye':
      return 'Règlement Impayés';
    case 'manuelle':
    case 'manuel':
      return 'Entrée';
    default:
      return transaction.type === 'income' ? 'Entrée' : 'Sortie';
  }
};

// Fonction pour déterminer la couleur du badge selon le type
const getTransactionTypeColor = (transaction: Transaction) => {
  const displayType = getTransactionDisplayType(transaction);
  
  switch (displayType) {
    case 'Vente':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Règlement Impayés':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Entrée':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Sortie':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
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
              {transactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{transaction.category}</p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTransactionTypeColor(transaction)}`}>
                      {getTransactionDisplayType(transaction)}
                    </span>
                  </div>
                  <div>
                    {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm')}
                  </div>
                  <div className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsHistory;
