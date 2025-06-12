
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { PrintBonLivraisonContent } from './PrintBonLivraisonContent';

interface PrintBonLivraisonDialogProps {
  bon: any;
}

export const PrintBonLivraisonDialog = ({ bon }: PrintBonLivraisonDialogProps) => {
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-gray-500 hover:bg-gray-600 text-white border-gray-500"
        onClick={() => setOpen(true)}
        title="Imprimer"
      >
        <Printer className="h-3 w-3" />
      </Button>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>Aperçu avant impression - {bon.numero_bon}</DialogTitle>
        </DialogHeader>
        <div className="print:hidden mb-4">
          <Button onClick={handlePrint} className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
        </div>
        <PrintBonLivraisonContent bon={bon} />
      </DialogContent>
    </Dialog>
  );
};
