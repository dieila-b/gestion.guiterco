
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

type Transaction = {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  paymentMethod: string;
};

interface TransactionsHistoryProps {
  transactions: Transaction[];
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  formatCurrency: (amount: number) => string;
}

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
                    <span className={`status-badge ${transaction.type === 'income' ? 'completed' : 'cancelled'}`}>
                      {transaction.type === 'income' ? 'Entrée' : 'Dépense'}
                    </span>
                  </div>
                  <div>
                    {format(transaction.date, 'dd/MM/yyyy HH:mm')}
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
