
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Filter } from 'lucide-react';

interface UnpaidInvoicesActionsProps {
  showResults: boolean;
  onGenerateReport: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

const UnpaidInvoicesActions: React.FC<UnpaidInvoicesActionsProps> = ({
  showResults,
  onGenerateReport,
  onExportPDF,
  onExportExcel,
}) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onGenerateReport}>
        <Filter className="mr-2 h-4 w-4" />
        Générer le rapport
      </Button>
      {showResults && (
        <>
          <Button variant="outline" onClick={onExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={onExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </>
      )}
    </div>
  );
};

export default UnpaidInvoicesActions;
