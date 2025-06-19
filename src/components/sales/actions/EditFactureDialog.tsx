
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Edit } from 'lucide-react';
import { format } from 'date-fns';
import PaymentSection from './PaymentSection';
import DeliverySection from './DeliverySection';
import type { FactureVente } from '@/types/sales';
import { formatCurrency } from '@/lib/currency';
import { calculatePaidAmount, calculateRemainingAmount, getActualDeliveryStatus } from '../table/StatusUtils';

interface EditFactureDialogProps {
  facture: FactureVente;
  children?: React.ReactNode;
}

const EditFactureDialog = ({ facture, children }: EditFactureDialogProps) => {
  const [open, setOpen] = useState(false);

  const paidAmount = calculatePaidAmount(facture);
  const remainingAmount = calculateRemainingAmount(facture);
  const dateFacture = format(new Date(facture.date_facture), 'yyyy-MM-dd');
  const dateEcheance = facture.date_echeance ? format(new Date(facture.date_echeance), 'yyyy-MM-dd') : '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-orange-100"
            title="Modifier"
          >
            <Edit className="h-4 w-4 text-orange-600" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Modifier la facture {facture.numero_facture}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Section informations générales repliable */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="general-info" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Informations générales</span>
                  <span className="text-sm text-muted-foreground">
                    ({facture.numero_facture} - {formatCurrency(facture.montant_ttc)})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label>Numéro de facture</Label>
                    <Input value={facture.numero_facture} readOnly />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-full">
                      <Label>Date de facture</Label>
                      <Input value={dateFacture} readOnly type="date" />
                    </div>
                    <div className="w-full">
                      <Label>Échéance</Label>
                      <Input value={dateEcheance || '--'} readOnly type="date" />
                    </div>
                  </div>
                  <div>
                    <Label>Client</Label>
                    <Input value={facture.client?.nom || facture.client_id} readOnly />
                  </div>
                  <div>
                    <Label>Montant total TTC</Label>
                    <Input value={formatCurrency(facture.montant_ttc)} readOnly />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Section paiements et livraison - toujours visibles */}
          <div className="grid md:grid-cols-2 gap-4">
            <PaymentSection facture={facture} remainingAmount={remainingAmount} />
            <DeliverySection facture={facture} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditFactureDialog;
