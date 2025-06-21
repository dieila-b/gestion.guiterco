
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { CompleteTransaction, CompleteTransactionFilters } from "@/hooks/useCompleteTransactionHistory";
import { formatCurrency } from "@/lib/currency";
import jsPDF from 'jspdf';

interface ExportTransactionsDialogProps {
  transactions: CompleteTransaction[];
  filters: CompleteTransactionFilters;
  stats: {
    soldeActif: number;
    totalEntrees: number;
    totalSorties: number;
    balance: number;
  };
}

const ExportTransactionsDialog: React.FC<ExportTransactionsDialogProps> = ({
  transactions,
  filters,
  stats
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(16);
    doc.text('Historique des Transactions', 20, 20);
    
    // Période
    let periode = '';
    if (filters.startDate && filters.endDate) {
      periode = `Du ${filters.startDate.toLocaleDateString('fr-FR')} au ${filters.endDate.toLocaleDateString('fr-FR')}`;
    } else {
      periode = `${filters.year}/${filters.month.toString().padStart(2, '0')}`;
      if (filters.day) {
        periode += `/${filters.day.toString().padStart(2, '0')}`;
      }
    }
    
    doc.setFontSize(12);
    doc.text(`Période: ${periode}`, 20, 35);
    
    // Statistiques
    doc.text(`Solde actif: ${formatCurrency(stats.soldeActif)}`, 20, 50);
    doc.text(`Total entrées: ${formatCurrency(stats.totalEntrees)}`, 20, 60);
    doc.text(`Total sorties: ${formatCurrency(stats.totalSorties)}`, 20, 70);
    doc.text(`Balance: ${formatCurrency(stats.balance)}`, 20, 80);
    
    // Tableau des transactions
    let yPosition = 100;
    doc.setFontSize(10);
    doc.text('Date', 20, yPosition);
    doc.text('Type', 50, yPosition);
    doc.text('Description', 80, yPosition);
    doc.text('Montant', 150, yPosition);
    doc.text('Source', 180, yPosition);
    
    yPosition += 10;
    
    transactions.forEach((transaction, index) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      const date = new Date(transaction.date).toLocaleDateString('fr-FR');
      const type = transaction.type === 'income' ? 'Entrée' : 'Sortie';
      const montant = transaction.type === 'income' ? 
        `+${formatCurrency(transaction.amount)}` : 
        `-${formatCurrency(transaction.amount)}`;
      
      doc.text(date, 20, yPosition);
      doc.text(type, 50, yPosition);
      doc.text(transaction.description.substring(0, 25), 80, yPosition);
      doc.text(montant, 150, yPosition);
      doc.text(transaction.source || '', 180, yPosition);
      
      yPosition += 8;
    });
    
    doc.save(`transactions_${Date.now()}.pdf`);
  };

  const generateCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Montant', 'Source'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(transaction => [
        new Date(transaction.date).toLocaleDateString('fr-FR'),
        transaction.type === 'income' ? 'Entrée' : 'Sortie',
        `"${transaction.description}"`,
        transaction.amount,
        `"${transaction.source || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (exportFormat === 'pdf') {
        generatePDF();
      } else {
        generateCSV();
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
        <Button variant="outline" size="default">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exporter les transactions</DialogTitle>
          <DialogDescription>
            Exporter {transactions.length} transaction(s) selon les filtres appliqués
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Format d'export</label>
            <Select value={exportFormat} onValueChange={(value: 'pdf' | 'csv') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>Solde actif: <strong>{formatCurrency(stats.soldeActif)}</strong></div>
              <div>Total entrées: <strong>{formatCurrency(stats.totalEntrees)}</strong></div>
              <div>Total sorties: <strong>{formatCurrency(stats.totalSorties)}</strong></div>
              <div>Balance: <strong>{formatCurrency(stats.balance)}</strong></div>
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

export default ExportTransactionsDialog;
