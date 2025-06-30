import React, { useState, useEffect } from 'react';
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
import { useReglementsAchat } from '@/hooks/useReglementsAchat';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';

interface EditFactureAchatDialogProps {
  facture: any;
}

export const EditFactureAchatDialog = ({ facture }: EditFactureAchatDialogProps) => {
  const [open, setOpen] = useState(false);
  const { updateFactureAchat } = useFacturesAchat();
  const { reglements, createReglement } = useReglementsAchat(facture.id);
  
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

  // Calculs des montants avec mise à jour en temps réel
  const acompteVerse = facture.bon_commande?.montant_paye || 0;
  const reglementsTotal = reglements?.reduce((sum: number, reglement: any) => {
    return sum + (reglement.montant || 0);
  }, 0) || 0;
  const montantPaye = acompteVerse + reglementsTotal;
  const montantRestant = Math.max(0, formData.montant_ttc - montantPaye);

  // État pour les nouveaux paiements avec validation
  const [nouveauPaiement, setNouveauPaiement] = useState({
    montant: 0,
    mode_paiement: 'virement',
    reference: '',
    date_reglement: new Date().toISOString().split('T')[0]
  });

  // Calcul du nouveau solde en temps réel - MISE À JOUR PRINCIPALE
  const nouveauSoldeApresReglement = Math.max(0, montantRestant - (nouveauPaiement.montant || 0));
  const pourcentagePaye = formData.montant_ttc > 0 ? 
    ((montantPaye + (nouveauPaiement.montant || 0)) / formData.montant_ttc) * 100 : 0;

  // Validation en temps réel du montant de paiement
  const handleMontantChange = (value: string) => {
    const montant = parseFloat(value) || 0;
    
    // Limiter le montant au reste à payer
    if (montant > montantRestant) {
      toast({
        title: "Montant invalide",
        description: `Le montant ne peut pas dépasser ${formatCurrency(montantRestant)} (reste à payer)`,
        variant: "destructive",
      });
      setNouveauPaiement(prev => ({ ...prev, montant: montantRestant }));
    } else {
      setNouveauPaiement(prev => ({ ...prev, montant }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation avant soumission
      if (nouveauPaiement.montant > montantRestant) {
        toast({
          title: "Erreur",
          description: "Le montant du paiement dépasse le reste à payer",
          variant: "destructive",
        });
        return;
      }

      // Si un nouveau paiement est ajouté, créer d'abord le règlement
      if (nouveauPaiement.montant > 0) {
        await createReglement.mutateAsync({
          facture_achat_id: facture.id,
          montant: nouveauPaiement.montant,
          mode_paiement: nouveauPaiement.mode_paiement,
          date_reglement: new Date(nouveauPaiement.date_reglement).toISOString(),
          reference_paiement: nouveauPaiement.reference || undefined,
          created_by: 'user'
        });
      }

      // Déterminer le statut de paiement automatiquement
      const totalPaye = montantPaye + nouveauPaiement.montant;
      let nouveauStatut = 'en_attente';
      
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
      
      setOpen(false);
      setNouveauPaiement({
        montant: 0,
        mode_paiement: 'virement',
        reference: '',
        date_reglement: new Date().toISOString().split('T')[0]
      });
      
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

            {/* Section Paiements améliorée avec mise à jour en temps réel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gestion des paiements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Résumé des paiements en temps réel */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg space-y-3 border border-blue-200">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>Montant total TTC:</span>
                    <span className="text-lg font-bold text-blue-800">{formatCurrency(formData.montant_ttc)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Total payé:</span>
                      <span className="font-semibold">{formatCurrency(montantPaye)}</span>
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
                    
                    {nouveauPaiement.montant > 0 && (
                      <div className="flex justify-between text-xs text-green-600 ml-4">
                        <span>• Nouveau paiement:</span>
                        <span>+{formatCurrency(nouveauPaiement.montant)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* AFFICHAGE EN TEMPS RÉEL DU MONTANT RESTANT */}
                  <div className="flex justify-between text-sm font-bold">
                    <span className={nouveauSoldeApresReglement > 0 ? 'text-orange-600' : 'text-green-600'}>
                      Reste à payer:
                    </span>
                    <span className={`text-lg ${nouveauSoldeApresReglement > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatCurrency(nouveauSoldeApresReglement)}
                    </span>
                  </div>
                  
                  {/* Barre de progression en temps réel */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progression du paiement</span>
                      <span>{Math.round(pourcentagePaye)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          pourcentagePaye >= 100 ? 'bg-green-500' : 
                          pourcentagePaye >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(pourcentagePaye, 100)}%` }}
                      ></div>
                    </div>
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

                {/* Nouveau paiement avec validation et mise à jour en temps réel */}
                {montantRestant > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 text-green-700">💰 Nouveau règlement</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="nouveau_montant">
                            Montant à encaisser
                            <span className="text-xs text-gray-500 block">
                              Max: {formatCurrency(montantRestant)}
                            </span>
                          </Label>
                          <Input
                            id="nouveau_montant"
                            type="number"
                            step="0.01"
                            min="0"
                            max={montantRestant}
                            value={nouveauPaiement.montant || ''}
                            onChange={(e) => handleMontantChange(e.target.value)}
                            placeholder="0"
                            className={nouveauPaiement.montant > montantRestant ? 'border-red-500' : ''}
                          />
                          {/* AFFICHAGE TEMPS RÉEL DU NOUVEAU SOLDE */}
                          {nouveauPaiement.montant > 0 && (
                            <div className="text-sm mt-2 p-2 bg-green-50 border border-green-200 rounded">
                              <div className="text-green-700 font-medium">
                                Reste à payer : {formatCurrency(nouveauSoldeApresReglement)}
                              </div>
                              {nouveauSoldeApresReglement === 0 && (
                                <div className="text-green-600 text-xs mt-1">
                                  ✅ Facture entièrement réglée
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="mode_paiement_nouveau">Mode de paiement</Label>
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
            <Button 
              type="submit" 
              disabled={updateFactureAchat.isPending || createReglement.isPending || nouveauPaiement.montant > montantRestant}
              className={nouveauPaiement.montant > 0 ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {(updateFactureAchat.isPending || createReglement.isPending) ? 'Mise à jour...' : 
               nouveauPaiement.montant > 0 ? `Encaisser ${formatCurrency(nouveauPaiement.montant)}` : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
