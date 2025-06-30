
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit } from 'lucide-react';
import { useFacturesAchat } from '@/hooks/useFacturesAchat';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';

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

  // Calculs des montants
  const acompteVerse = facture.bon_commande?.montant_paye || 0;
  const reglementsTotal = facture.reglements?.reduce((sum: number, reglement: any) => {
    return sum + (reglement.montant || 0);
  }, 0) || 0;
  const montantPaye = acompteVerse + reglementsTotal;
  const montantRestant = formData.montant_ttc - montantPaye;

  // État pour les nouveaux paiements
  const [nouveauPaiement, setNouveauPaiement] = useState({
    montant: 0,
    mode_paiement: 'virement',
    reference: '',
    date_reglement: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Déterminer le statut de paiement automatiquement
      let nouveauStatut = 'en_attente';
      const totalPaye = montantPaye + nouveauPaiement.montant;
      
      if (totalPaye >= formData.montant_ttc) {
        nouveauStatut = 'paye';
      } else if (totalPaye > 0) {
        nouveauStatut = 'partiellement_paye';
      }

      await updateFactureAchat.mutateAsync({
        id: facture.id,
        ...formData,
        statut_paiement: nouveauStatut,
        date_facture: formData.date_facture ? new Date(formData.date_facture).toISOString() : undefined,
        date_echeance: formData.date_echeance ? new Date(formData.date_echeance).toISOString() : undefined
      });

      // Si un nouveau paiement est ajouté, créer un règlement
      if (nouveauPaiement.montant > 0) {
        // TODO: Créer l'entrée dans reglements_achat
        console.log('Nouveau paiement à enregistrer:', nouveauPaiement);
      }
      
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la facture d'achat - {facture.numero_facture}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div>
                  <Label htmlFor="observations">Observations</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section Paiements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gestion des paiements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Résumé des paiements */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Montant total TTC:</span>
                    <span className="font-medium">{formatCurrency(formData.montant_ttc)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Total payé:</span>
                    <span className="font-medium">{formatCurrency(montantPaye)}</span>
                  </div>
                  {acompteVerse > 0 && (
                    <div className="flex justify-between text-xs text-blue-600 ml-4">
                      <span>• Acompte BC:</span>
                      <span>{formatCurrency(acompteVerse)}</span>
                    </div>
                  )}
                  {reglementsTotal > 0 && (
                    <div className="flex justify-between text-xs text-blue-600 ml-4">
                      <span>• Règlements:</span>
                      <span>{formatCurrency(reglementsTotal)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-sm font-bold text-orange-600">
                    <span>Reste à payer:</span>
                    <span>{formatCurrency(montantRestant)}</span>
                  </div>
                </div>

                {/* Statut de paiement */}
                <div>
                  <Label htmlFor="statut_paiement">Statut paiement</Label>
                  <Select value={formData.statut_paiement} onValueChange={(value) => setFormData({ ...formData, statut_paiement: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="partiellement_paye">Partiellement payé</SelectItem>
                      <SelectItem value="paye">Payé</SelectItem>
                      <SelectItem value="en_retard">En retard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nouveau paiement */}
                {montantRestant > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Nouveau paiement</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="nouveau_montant">Montant</Label>
                          <Input
                            id="nouveau_montant"
                            type="number"
                            step="0.01"
                            max={montantRestant}
                            value={nouveauPaiement.montant || ''}
                            onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, montant: parseFloat(e.target.value) || 0 })}
                            placeholder={`Max: ${formatCurrency(montantRestant)}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor="mode_paiement_nouveau">Mode</Label>
                          <Select value={nouveauPaiement.mode_paiement} onValueChange={(value) => setNouveauPaiement({ ...nouveauPaiement, mode_paiement: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="virement">Virement</SelectItem>
                              <SelectItem value="cheque">Chèque</SelectItem>
                              <SelectItem value="especes">Espèces</SelectItem>
                              <SelectItem value="carte">Carte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="reference_paiement">Référence paiement</Label>
                        <Input
                          id="reference_paiement"
                          value={nouveauPaiement.reference}
                          onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, reference: e.target.value })}
                          placeholder="N° de transaction, chèque..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateFactureAchat.isPending}>
              {updateFactureAchat.isPending ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
