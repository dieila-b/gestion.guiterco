
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { useFacturesAchat } from '@/hooks/useFacturesAchat';
import { toast } from '@/hooks/use-toast';

interface EditFactureAchatDialogProps {
  facture: any;
}

export const EditFactureAchatDialog = ({ facture }: EditFactureAchatDialogProps) => {
  const [open, setOpen] = useState(false);
  const { updateFactureAchat } = useFacturesAchat();
  
  const [formData, setFormData] = useState({
    numero_facture: facture.numero_facture || '',
    fournisseur: facture.fournisseur || '',
    date_facture: facture.date_facture ? facture.date_facture.split('T')[0] : '',
    date_echeance: facture.date_echeance ? facture.date_echeance.split('T')[0] : '',
    montant_ht: facture.montant_ht || 0,
    tva: facture.tva || 0,
    montant_ttc: facture.montant_ttc || 0,
    statut_paiement: facture.statut_paiement || 'en_attente',
    mode_paiement: facture.mode_paiement || '',
    observations: facture.observations || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateFactureAchat.mutateAsync({
        id: facture.id,
        ...formData,
        date_facture: formData.date_facture ? new Date(formData.date_facture).toISOString() : undefined,
        date_echeance: formData.date_echeance ? new Date(formData.date_echeance).toISOString() : undefined
      });
      
      setOpen(false);
      toast({
        title: "Facture d'achat modifiée",
        description: "La facture d'achat a été mise à jour avec succès.",
      });
    } catch (error) {
      console.error('Error updating facture achat:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la facture d'achat.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
        >
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier la facture d'achat</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero_facture">N° Facture</Label>
              <Input
                id="numero_facture"
                value={formData.numero_facture}
                onChange={(e) => setFormData({ ...formData, numero_facture: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="fournisseur">Fournisseur</Label>
              <Input
                id="fournisseur"
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_facture">Date facture</Label>
              <Input
                id="date_facture"
                type="date"
                value={formData.date_facture}
                onChange={(e) => setFormData({ ...formData, date_facture: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="date_echeance">Date échéance</Label>
              <Input
                id="date_echeance"
                type="date"
                value={formData.date_echeance}
                onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="montant_ht">Montant HT</Label>
              <Input
                id="montant_ht"
                type="number"
                step="0.01"
                value={formData.montant_ht}
                onChange={(e) => setFormData({ ...formData, montant_ht: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="tva">TVA</Label>
              <Input
                id="tva"
                type="number"
                step="0.01"
                value={formData.tva}
                onChange={(e) => setFormData({ ...formData, tva: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="montant_ttc">Montant TTC</Label>
              <Input
                id="montant_ttc"
                type="number"
                step="0.01"
                value={formData.montant_ttc}
                onChange={(e) => setFormData({ ...formData, montant_ttc: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="statut_paiement">Statut paiement</Label>
              <Select value={formData.statut_paiement} onValueChange={(value) => setFormData({ ...formData, statut_paiement: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="paye">Payé</SelectItem>
                  <SelectItem value="partiellement_paye">Partiellement payé</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mode_paiement">Mode de paiement</Label>
              <Input
                id="mode_paiement"
                value={formData.mode_paiement}
                onChange={(e) => setFormData({ ...formData, mode_paiement: e.target.value })}
                placeholder="Ex: Virement, Chèque, Espèces..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateFactureAchat.isPending}>
              {updateFactureAchat.isPending ? 'Mise à jour...' : 'Modifier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
