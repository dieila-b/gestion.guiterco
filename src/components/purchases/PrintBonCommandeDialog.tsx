
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { PrintBonCommandeContent } from './PrintBonCommandeContent';

interface PrintBonCommandeDialogProps {
  bon: any;
  open: boolean;
  onClose: () => void;
}

export const PrintBonCommandeDialog = ({ bon, open, onClose }: PrintBonCommandeDialogProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
        <PrintBonCommandeContent bon={bon} />
      </DialogContent>
    </Dialog>
  );
};
