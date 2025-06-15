
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { format } from 'date-fns';
import PaymentSection from './PaymentSection';
import DeliverySection from './DeliverySection';
import type { FactureVente } from '@/types/sales';
import { formatCurrency } from '@/lib/currency';
import { calculatePaidAmount, calculateRemainingAmount, getActualDeliveryStatus } from '../table/StatusUtils';

interface EditFactureDialogProps {
  facture: FactureVente;
}

const EditFactureDialog = ({ facture }: EditFactureDialogProps) => {
  const [open, setOpen] = useState(false);

  const paidAmount = calculatePaidAmount(facture);
  const remainingAmount = calculateRemainingAmount(facture);
  const dateFacture = format(new Date(facture.date_facture), 'yyyy-MM-dd');
  const dateEcheance = facture.date_echeance ? format(new Date(facture.date_echeance), 'yyyy-MM-dd') : '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-orange-100"
          title="Modifier"
        >
          <Edit className="h-4 w-4 text-orange-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Modifier la facture {facture.numero_facture}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Affichage d'informations de base, non modifiables */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
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
            </CardContent>
          </Card>
          
          {/* Section paiements et livraison fusionnées */}
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
