
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { PrecommandeComplete } from '@/types/precommandes';
import { formatCurrency } from '@/lib/currency';
import { calculerTotalPrecommande } from './PrecommandesTableUtils';

interface EditPrecommandeDialogProps {
  precommande: PrecommandeComplete | null;
  open: boolean;
  onClose: () => void;
}

const EditPrecommandeDialog = ({ precommande, open, onClose }: EditPrecommandeDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    observations: '',
    acompte_verse: 0,
    date_livraison_prevue: '',
  });

  useEffect(() => {
    if (precommande) {
      setFormData({
        observations: precommande.observations || '',
        acompte_verse: precommande.acompte_verse || 0,
        date_livraison_prevue: precommande.date_livraison_prevue 
          ? new Date(precommande.date_livraison_prevue).toISOString().split('T')[0] 
          : '',
      });
    }
  }, [precommande]);

  const handleSave = async () => {
    if (!precommande) return;

    setIsLoading(true);
    try {
      // TODO: Implementer la logique de sauvegarde via Supabase
      console.log('Sauvegarde des modifications:', {
        id: precommande.id,
        ...formData
      });
      
      toast({
        title: "Précommande modifiée",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la précommande",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrecommande = precommande ? calculerTotalPrecommande(precommande) : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Éditer la précommande {precommande?.numero_precommande}
          </DialogTitle>
        </DialogHeader>

        {precommande && (
          <div className="space-y-6">
            {/* Informations client */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Client</h3>
              <p>{precommande.client?.nom || 'Client non spécifié'}</p>
            </div>

            {/* Articles */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Articles commandés</h3>
              <div className="space-y-2">
                {precommande.lignes_precommande?.map((ligne) => (
                  <div key={ligne.id} className="flex justify-between items-center text-sm">
                    <span>{ligne.article?.nom || 'Article'}</span>
                    <span>Qté: {ligne.quantite} × {formatCurrency(ligne.prix_unitaire)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t font-semibold">
                Total: {formatCurrency(totalPrecommande)}
              </div>
            </div>

            {/* Formulaire d'édition */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="date_livraison">Date de livraison prévue</Label>
                <Input
                  id="date_livraison"
                  type="date"
                  value={formData.date_livraison_prevue}
                  onChange={(e) => setFormData({ ...formData, date_livraison_prevue: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="acompte">Acompte versé</Label>
                <Input
                  id="acompte"
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalPrecommande}
                  value={formData.acompte_verse}
                  onChange={(e) => setFormData({ ...formData, acompte_verse: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Reste à payer: {formatCurrency(totalPrecommande - formData.acompte_verse)}
                </p>
              </div>

              <div>
                <Label htmlFor="observations">Observations</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Observations sur cette précommande..."
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPrecommandeDialog;
