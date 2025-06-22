
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useAllFinancialTransactions } from '@/hooks/useTransactions';

const ExportHistoryDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  
  const { data: transactions = [] } = useAllFinancialTransactions();

  const generateCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Montant', 'Source'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(transaction => [
        new Date(transaction.date).toLocaleDateString('fr-FR'),
        transaction.type === 'income' ? 'Entrée' : 'Sortie',
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.amount,
        `"${transaction.source || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historique_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateExcel = () => {
    // Format Excel simple (CSV avec extension .xls)
    const headers = ['Date', 'Type', 'Description', 'Montant', 'Source'];
    const csvContent = [
      headers.join('\t'),
      ...transactions.map(transaction => [
        new Date(transaction.date).toLocaleDateString('fr-FR'),
        transaction.type === 'income' ? 'Entrée' : 'Sortie',
        transaction.description.replace(/\t/g, ' '),
        formatCurrency(transaction.amount),
        transaction.source || ''
      ].join('\t'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historique_transactions_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (exportFormat === 'csv') {
        generateCSV();
      } else {
        generateExcel();
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Exporter historique
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exporter l'historique des transactions</DialogTitle>
          <DialogDescription>
            Exporter {transactions.length} transaction(s) du jour
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Format d'export</label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>Nombre de transactions: <strong>{transactions.length}</strong></div>
              <div>Total entrées: <strong>{formatCurrency(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}</strong></div>
              <div>Total sorties: <strong>{formatCurrency(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}</strong></div>
              <div>Balance: <strong>{formatCurrency(transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0))}</strong></div>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Export en cours...' : 'Exporter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportHistoryDialog;
