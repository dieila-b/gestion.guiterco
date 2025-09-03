import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllFinancialTransactions } from '@/hooks/useTransactions';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

interface BalanceDuJourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BalanceDuJourModal: React.FC<BalanceDuJourModalProps> = ({ isOpen, onClose }) => {
  const { data: transactions, isLoading } = useAllFinancialTransactions();

  const totalEntrees = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalSorties = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
  const balance = totalEntrees - totalSorties;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Balance du jour - {format(new Date(), 'dd/MM/yyyy')}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold text-green-800">
              Total entrées : {formatCurrency(totalEntrees)}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-lg font-semibold text-red-800">
              Total sorties : {formatCurrency(totalSorties)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <p className={`text-lg font-semibold ${balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              Balance : {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p>Chargement des transactions...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aucune transaction aujourd'hui
                  </TableCell>
                </TableRow>
              ) : (
                transactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? 'Entrée' : 'Sortie'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{transaction.source || '-'}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {transaction.date ? format(new Date(transaction.date), 'HH:mm') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BalanceDuJourModal;