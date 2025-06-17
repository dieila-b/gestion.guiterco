
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';

interface UnpaidInvoicesHeaderProps {
  onPrint: () => void;
  onExportPDF: () => void;
}

const UnpaidInvoicesHeader: React.FC<UnpaidInvoicesHeaderProps> = ({
  onPrint,
  onExportPDF,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
      <div>
        <h2 className="text-2xl font-bold mb-1">Factures Impayées</h2>
        <div className="text-muted-foreground mb-2">Liste de toutes les factures avec un solde restant.</div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrint}>
          <Printer className="mr-2"/> Imprimer
        </Button>
        <Button variant="outline" onClick={onExportPDF}>
          <Download className="mr-2"/> Exporter PDF
        </Button>
      </div>
    </div>
  );
};

export default UnpaidInvoicesHeader;
