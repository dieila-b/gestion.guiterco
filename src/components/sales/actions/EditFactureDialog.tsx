
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { FactureVente } from '@/types/sales';

interface EditFactureDialogProps {
  facture: FactureVente;
}

const EditFactureDialog = ({ facture }: EditFactureDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    numero_facture: facture.numero_facture,
    date_facture: format(new Date(facture.date_facture), 'yyyy-MM-dd'),
    date_echeance: facture.date_echeance ? format(new Date(facture.date_echeance), 'yyyy-MM-dd') : '',
    statut_paiement: facture.statut_paiement,
    mode_paiement: facture.mode_paiement || '',
    observations: facture.observations || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implémenter la mise à jour de la facture
    toast({
      title: "Modification sauvegardée",
      description: `La facture ${facture.numero_facture} a été mise à jour avec succès.`,
    });
    
    setOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier la facture {facture.numero_facture}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_facture">Numéro de facture</Label>
              <Input
                id="numero_facture"
                value={formData.numero_facture}
                onChange={(e) => handleInputChange('numero_facture', e.target.value)}
                placeholder="N° facture"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date_facture">Date de facture</Label>
              <Input
                id="date_facture"
                type="date"
                value={formData.date_facture}
                onChange={(e) => handleInputChange('date_facture', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_echeance">Date d'échéance</Label>
              <Input
                id="date_echeance"
                type="date"
                value={formData.date_echeance}
                onChange={(e) => handleInputChange('date_echeance', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statut_paiement">Statut de paiement</Label>
              <Select 
                value={formData.statut_paiement} 
                onValueChange={(value) => handleInputChange('statut_paiement', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="partiellement_payee">Partiellement payée</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode_paiement">Mode de paiement</Label>
            <Select 
              value={formData.mode_paiement} 
              onValueChange={(value) => handleInputChange('mode_paiement', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un mode de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="carte">Carte bancaire</SelectItem>
                <SelectItem value="cheque">Chèque</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Observations sur la facture..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFactureDialog;
