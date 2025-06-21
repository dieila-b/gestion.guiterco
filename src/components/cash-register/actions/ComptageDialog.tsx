
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Euro } from 'lucide-react';
import { useCreateComptage, ComptageDetails } from '@/hooks/useCashActions';
import { formatCurrency } from '@/lib/currency';

interface ComptageDialogProps {
  cashRegisterId?: string;
  soldeTheorique: number;
}

const ComptageDialog: React.FC<ComptageDialogProps> = ({ cashRegisterId, soldeTheorique }) => {
  const [open, setOpen] = useState(false);
  const [montantReel, setMontantReel] = useState(0);
  const [observations, setObservations] = useState('');
  const [modeSimple, setModeSimple] = useState(true);
  const [coupures, setCoupures] = useState<ComptageDetails>({
    billet_500: 0, billet_200: 0, billet_100: 0, billet_50: 0,
    billet_20: 0, billet_10: 0, billet_5: 0,
    piece_2: 0, piece_1: 0, piece_050: 0, piece_020: 0,
    piece_010: 0, piece_005: 0, piece_002: 0, piece_001: 0
  });

  const createComptage = useCreateComptage();

  const calculerMontantCoupures = () => {
    return (
      coupures.billet_500 * 500 + coupures.billet_200 * 200 + coupures.billet_100 * 100 +
      coupures.billet_50 * 50 + coupures.billet_20 * 20 + coupures.billet_10 * 10 +
      coupures.billet_5 * 5 + coupures.piece_2 * 2 + coupures.piece_1 * 1 +
      coupures.piece_050 * 0.5 + coupures.piece_020 * 0.2 + coupures.piece_010 * 0.1 +
      coupures.piece_005 * 0.05 + coupures.piece_002 * 0.02 + coupures.piece_001 * 0.01
    );
  };

  const montantCalcule = modeSimple ? montantReel : calculerMontantCoupures();
  const ecart = montantCalcule - soldeTheorique;

  const handleSubmit = () => {
    if (!cashRegisterId) return;

    createComptage.mutate({
      cash_register_id: cashRegisterId,
      montant_theorique: soldeTheorique,
      montant_reel: montantCalcule,
      details_coupures: modeSimple ? undefined : coupures,
      observations
    }, {
      onSuccess: () => {
        setOpen(false);
        setMontantReel(0);
        setObservations('');
        setCoupures({
          billet_500: 0, billet_200: 0, billet_100: 0, billet_50: 0,
          billet_20: 0, billet_10: 0, billet_5: 0,
          piece_2: 0, piece_1: 0, piece_050: 0, piece_020: 0,
          piece_010: 0, piece_005: 0, piece_002: 0, piece_001: 0
        });
      }
    });
  };

  const CoupureInput = ({ label, value, field }: { label: string; value: number; field: keyof ComptageDetails }) => (
    <div className="grid grid-cols-3 gap-2 items-center">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        min="0"
        value={coupures[field]}
        onChange={(e) => setCoupures(prev => ({ ...prev, [field]: parseInt(e.target.value) || 0 }))}
        className="text-center"
      />
      <div className="text-sm text-muted-foreground">
        {formatCurrency(coupures[field] * value)}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Calculator className="mr-2 h-4 w-4" />
          Effectuer un comptage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comptage de caisse</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Solde théorique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(soldeTheorique)}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant={modeSimple ? "default" : "outline"}
              onClick={() => setModeSimple(true)}
              size="sm"
            >
              Mode simple
            </Button>
            <Button
              variant={!modeSimple ? "default" : "outline"}
              onClick={() => setModeSimple(false)}
              size="sm"
            >
              Détail par coupures
            </Button>
          </div>

          {modeSimple ? (
            <div className="space-y-2">
              <Label>Montant réel en caisse</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={montantReel}
                onChange={(e) => setMontantReel(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Euro className="mr-2 h-4 w-4" />
                  Détail par coupures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Billets</h4>
                  <CoupureInput label="500 €" value={500} field="billet_500" />
                  <CoupureInput label="200 €" value={200} field="billet_200" />
                  <CoupureInput label="100 €" value={100} field="billet_100" />
                  <CoupureInput label="50 €" value={50} field="billet_50" />
                  <CoupureInput label="20 €" value={20} field="billet_20" />
                  <CoupureInput label="10 €" value={10} field="billet_10" />
                  <CoupureInput label="5 €" value={5} field="billet_5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Pièces</h4>
                  <CoupureInput label="2 €" value={2} field="piece_2" />
                  <CoupureInput label="1 €" value={1} field="piece_1" />
                  <CoupureInput label="0,50 €" value={0.5} field="piece_050" />
                  <CoupureInput label="0,20 €" value={0.2} field="piece_020" />
                  <CoupureInput label="0,10 €" value={0.1} field="piece_010" />
                  <CoupureInput label="0,05 €" value={0.05} field="piece_005" />
                  <CoupureInput label="0,02 €" value={0.02} field="piece_002" />
                  <CoupureInput label="0,01 €" value={0.01} field="piece_001" />
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total calculé:</span>
                    <span>{formatCurrency(calculerMontantCoupures())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Montant réel</div>
                  <div className="text-lg font-semibold">{formatCurrency(montantCalcule)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Écart</div>
                  <div className={`text-lg font-semibold ${ecart >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ecart >= 0 ? '+' : ''}{formatCurrency(ecart)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>Observations (optionnel)</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Notes sur le comptage..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={createComptage.isPending}
              className="flex-1"
            >
              {createComptage.isPending ? 'Enregistrement...' : 'Enregistrer le comptage'}
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

export default ComptageDialog;
