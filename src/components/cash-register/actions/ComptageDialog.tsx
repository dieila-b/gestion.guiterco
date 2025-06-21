
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { useCreateComptage, ComptageDetails } from '@/hooks/cash';
import {
  SoldeTheoriqueCard,
  ModeToggleButtons,
  ModeSimpleInput,
  ModeDetailleCard,
  ResumeCard,
  ObservationsInput
} from './comptage';

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
    billet_20000: 0,
    billet_10000: 0,
    billet_5000: 0,
    billet_2000: 0,
    billet_1000: 0,
    billet_500: 0
  });

  const createComptage = useCreateComptage();

  const calculerMontantCoupures = () => {
    return (
      coupures.billet_20000 * 20000 +
      coupures.billet_10000 * 10000 +
      coupures.billet_5000 * 5000 +
      coupures.billet_2000 * 2000 +
      coupures.billet_1000 * 1000 +
      coupures.billet_500 * 500
    );
  };

  const montantCalcule = modeSimple ? montantReel : calculerMontantCoupures();
  const ecart = montantCalcule - soldeTheorique;

  const handleCoupureChange = (field: keyof ComptageDetails, value: number) => {
    setCoupures(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setMontantReel(0);
    setObservations('');
    setCoupures({
      billet_20000: 0,
      billet_10000: 0,
      billet_5000: 0,
      billet_2000: 0,
      billet_1000: 0,
      billet_500: 0
    });
  };

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
        resetForm();
      }
    });
  };

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
          <SoldeTheoriqueCard soldeTheorique={soldeTheorique} />
          
          <ModeToggleButtons modeSimple={modeSimple} onModeChange={setModeSimple} />

          {modeSimple ? (
            <ModeSimpleInput 
              montantReel={montantReel} 
              onMontantChange={setMontantReel} 
            />
          ) : (
            <ModeDetailleCard
              coupures={coupures}
              onCoupureChange={handleCoupureChange}
              montantCalcule={calculerMontantCoupures()}
            />
          )}

          <ResumeCard montantCalcule={montantCalcule} ecart={ecart} />

          <ObservationsInput 
            observations={observations} 
            onObservationsChange={setObservations} 
          />

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
