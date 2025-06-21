
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAllFinancialTransactions } from '@/hooks/useTransactions';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const ExportTransactionsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [dateDebut, setDateDebut] = useState<Date>();
  const [dateFin, setDateFin] = useState<Date>();

  const { data: transactions = [] } = useAllFinancialTransactions();

  const exportToPDF = (transactionsData: any[]) => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text('Export des Transactions', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, 20, 30);
    
    if (dateDebut && dateFin) {
      doc.text(`Période: du ${format(dateDebut, 'dd/MM/yyyy')} au ${format(dateFin, 'dd/MM/yyyy')}`, 20, 40);
    }
    
    // Tableau des transactions
    let yPosition = 60;
    const pageHeight = doc.internal.pageSize.height;
    
    // En-têtes du tableau
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date', 20, yPosition);
    doc.text('Type', 60, yPosition);
    doc.text('Montant', 100, yPosition);
    doc.text('Description', 140, yPosition);
    
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    
    // Données
    transactionsData.forEach((transaction, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      const date = format(new Date(transaction.date), 'dd/MM/yyyy');
      const type = transaction.type === 'income' ? 'Entrée' : 'Sortie';
      const montant = `${transaction.amount.toFixed(2)} €`;
      const description = transaction.description.substring(0, 30) + (transaction.description.length > 30 ? '...' : '');
      
      doc.text(date, 20, yPosition);
      doc.text(type, 60, yPosition);
      doc.text(montant, 100, yPosition);
      doc.text(description, 140, yPosition);
      
      yPosition += 8;
    });
    
    // Totaux
    yPosition += 10;
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    
    const totalEntrees = transactionsData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalSorties = transactionsData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalEntrees - totalSorties;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Entrées: ${totalEntrees.toFixed(2)} €`, 20, yPosition);
    doc.text(`Total Sorties: ${totalSorties.toFixed(2)} €`, 20, yPosition + 8);
    doc.text(`Balance: ${balance.toFixed(2)} €`, 20, yPosition + 16);
    
    // Téléchargement
    const fileName = `transactions_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
    doc.save(fileName);
  };

  const exportToCSV = (transactionsData: any[]) => {
    const headers = ['Date', 'Type', 'Montant', 'Description', 'Source'];
    const csvContent = [
      headers.join(','),
      ...transactionsData.map(transaction => [
        format(new Date(transaction.date), 'dd/MM/yyyy HH:mm'),
        transaction.type === 'income' ? 'Entrée' : 'Sortie',
        transaction.amount.toFixed(2),
        `"${transaction.description.replace(/"/g, '""')}"`,
        `"${transaction.source || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    let transactionsAExporter = [...transactions];

    // Filtrer par dates si spécifiées
    if (dateDebut) {
      transactionsAExporter = transactionsAExporter.filter(t => 
        new Date(t.date) >= dateDebut
      );
    }
    if (dateFin) {
      const finJournee = new Date(dateFin);
      finJournee.setHours(23, 59, 59, 999);
      transactionsAExporter = transactionsAExporter.filter(t => 
        new Date(t.date) <= finJournee
      );
    }

    if (transactionsAExporter.length === 0) {
      toast.error('Aucune transaction à exporter pour cette période');
      return;
    }

    try {
      if (exportFormat === 'pdf') {
        exportToPDF(transactionsAExporter);
      } else {
        exportToCSV(transactionsAExporter);
      }
      
      toast.success(`Export ${exportFormat.toUpperCase()} généré avec succès`);
      setOpen(false);
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Exporter les transactions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter les transactions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Format d'export</label>
            <Select value={exportFormat} onValueChange={(value: 'pdf' | 'csv') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    CSV (Excel)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Période (optionnel)</label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateDebut ? format(dateDebut, 'dd/MM/yyyy') : 'Date début'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateDebut}
                    onSelect={setDateDebut}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFin ? format(dateFin, 'dd/MM/yyyy') : 'Date fin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFin}
                    onSelect={setDateFin}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleExport} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportTransactionsDialog;
