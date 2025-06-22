
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useAllFinancialTransactions } from '@/hooks/useTransactions';
import jsPDF from 'jspdf';

const ExportHistoryDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
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

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // En-tête du document
    doc.setFontSize(18);
    doc.text('Historique des Transactions', 20, 20);
    
    // Date et informations générales
    doc.setFontSize(12);
    const today = new Date().toLocaleDateString('fr-FR');
    const time = new Date().toLocaleTimeString('fr-FR');
    doc.text(`Date d'export: ${today} à ${time}`, 20, 35);
    doc.text(`Nombre de transactions: ${transactions.length}`, 20, 45);
    
    // Calcul des totaux
    const totalEntrees = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalSorties = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalEntrees - totalSorties;
    
    // Récapitulatif financier
    doc.setFontSize(14);
    doc.text('Récapitulatif:', 20, 65);
    
    doc.setFontSize(11);
    doc.text(`Total entrées: ${formatCurrency(totalEntrees)}`, 25, 75);
    doc.text(`Total sorties: ${formatCurrency(totalSorties)}`, 25, 85);
    doc.text(`Balance: ${formatCurrency(balance)}`, 25, 95);
    
    // En-têtes du tableau
    doc.setFontSize(10);
    let yPosition = 115;
    doc.text('Date', 20, yPosition);
    doc.text('Type', 55, yPosition);
    doc.text('Description', 85, yPosition);
    doc.text('Montant', 150, yPosition);
    doc.text('Source', 180, yPosition);
    
    // Ligne de séparation
    doc.line(20, yPosition + 2, 200, yPosition + 2);
    yPosition += 10;
    
    // Données des transactions
    transactions.forEach((transaction, index) => {
      // Nouvelle page si nécessaire
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        
        // Répéter les en-têtes sur la nouvelle page
        doc.setFontSize(10);
        doc.text('Date', 20, yPosition);
        doc.text('Type', 55, yPosition);
        doc.text('Description', 85, yPosition);
        doc.text('Montant', 150, yPosition);
        doc.text('Source', 180, yPosition);
        doc.line(20, yPosition + 2, 200, yPosition + 2);
        yPosition += 10;
      }
      
      const date = new Date(transaction.date).toLocaleDateString('fr-FR');
      const type = transaction.type === 'income' ? 'Entrée' : 'Sortie';
      const description = transaction.description.length > 25 ? 
        transaction.description.substring(0, 22) + '...' : 
        transaction.description;
      const montant = transaction.type === 'income' ? 
        `+${formatCurrency(transaction.amount)}` : 
        `-${formatCurrency(transaction.amount)}`;
      const source = (transaction.source || '').length > 15 ? 
        (transaction.source || '').substring(0, 12) + '...' : 
        (transaction.source || '');
      
      doc.text(date, 20, yPosition);
      doc.text(type, 55, yPosition);
      doc.text(description, 85, yPosition);
      doc.text(montant, 150, yPosition);
      doc.text(source, 180, yPosition);
      
      yPosition += 8;
    });
    
    // Pied de page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} sur ${totalPages}`, 170, 290);
      doc.text(`Généré automatiquement le ${today}`, 20, 290);
    }
    
    // Téléchargement
    doc.save(`historique_transactions_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (exportFormat === 'csv') {
        generateCSV();
      } else if (exportFormat === 'excel') {
        generateExcel();
      } else if (exportFormat === 'pdf') {
        generatePDF();
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
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel' | 'pdf') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
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
