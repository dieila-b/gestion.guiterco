
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useCreatePrecommandeAcompte, useCompletePrecommandePayment } from '@/hooks/precommandes/usePrecommandePayment';
import { useUpdatePrecommande } from '@/hooks/precommandes/useUpdatePrecommande';

interface PaymentDialogProps {
  precommande: PrecommandeComplete;
  open: boolean;
  onClose: () => void;
  type: 'acompte' | 'solde';
}

const PaymentDialog = ({ precommande, open, onClose, type }: PaymentDialogProps) => {
  const [montant, setMontant] = useState(0);
  const [modePaiement, setModePaiement] = useState('especes');
  
  const createAcompte = useCreatePrecommandeAcompte();
  const completePaiement = useCompletePrecommandePayment();
  const updatePrecommande = useUpdatePrecommande();

  const montantTotal = precommande.lignes_precommande?.reduce((sum, ligne) => sum + ligne.montant_ligne, 0) || 0;
  const acompteVerse = precommande.acompte_verse || 0;
  const resteAPayer = montantTotal - acompteVerse;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (montant <= 0) return;

    try {
      if (type === 'acompte') {
        // Pour les acomptes, on met à jour directement la précommande
        // et on crée une transaction de caisse
        const nouveauAcompte = acompteVerse + montant;
        
        await Promise.all([
          updatePrecommande.mutateAsync({
            id: precommande.id,
            updates: { acompte_verse: nouveauAcompte }
          }),
          createAcompte.mutateAsync({
            precommandeId: precommande.id,
            montantAcompte: montant,
            modePaiement
          })
        ]);
      } else {
        // Pour le solde final
        await completePaiement.mutateAsync({
          precommandeId: precommande.id,
          montantFinal: montant,
          modePaiement
        });
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
    }
  };

  const isPending = createAcompte.isPending || completePaiement.isPending || updatePrecommande.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'acompte' ? 'Enregistrer un acompte' : 'Finaliser le paiement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Montant total:</span>
              <span className="font-semibold">{formatCurrency(montantTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Acompte versé:</span>
              <span className="font-semibold">{formatCurrency(acompteVerse)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Reste à payer:</span>
              <span className="text-blue-600">{formatCurrency(resteAPayer)}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="montant">
              {type === 'acompte' ? 'Montant de l\'acompte (GNF)' : 'Montant à encaisser (GNF)'}
            </Label>
            <Input
              id="montant"
              type="number"
              min="0"
              max={type === 'acompte' ? resteAPayer : resteAPayer}
              value={montant}
              onChange={(e) => setMontant(Number(e.target.value))}
              placeholder="0"
              required
            />
            {type === 'solde' && (
              <p className="text-sm text-gray-500 mt-1">
                Maximum: {formatCurrency(resteAPayer)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="mode-paiement">Mode de paiement</Label>
            <Select value={modePaiement} onValueChange={setModePaiement}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="carte">Carte bancaire</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
                <SelectItem value="cheque">Chèque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending || montant <= 0}>
              {isPending ? 'Traitement...' : 'Confirmer le paiement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
