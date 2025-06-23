
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import type { PrecommandeComplete, LignePrecommandeComplete } from '@/types/precommandes';
import { useCatalogue } from '@/hooks/useCatalogue';
import { formatCurrency } from '@/lib/currency';

interface EditPrecommandeFormProps {
  precommande: PrecommandeComplete;
  onSave: (updates: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditPrecommandeForm = ({ precommande, onSave, onCancel, isLoading }: EditPrecommandeFormProps) => {
  const { articles } = useCatalogue();
  const [formData, setFormData] = useState({
    observations: precommande.observations || '',
    date_livraison_prevue: precommande.date_livraison_prevue 
      ? new Date(precommande.date_livraison_prevue).toISOString().split('T')[0] 
      : '',
    acompte_verse: precommande.acompte_verse || 0,
    statut: precommande.statut || 'confirmee'
  });

  const [lignes, setLignes] = useState<LignePrecommandeComplete[]>(
    precommande.lignes_precommande || []
  );

  const handleLigneChange = (index: number, field: string, value: any) => {
    const newLignes = [...lignes];
    newLignes[index] = {
      ...newLignes[index],
      [field]: value,
      montant_ligne: field === 'quantite' || field === 'prix_unitaire' 
        ? (field === 'quantite' ? value : newLignes[index].quantite) * 
          (field === 'prix_unitaire' ? value : newLignes[index].prix_unitaire)
        : newLignes[index].montant_ligne
    };
    setLignes(newLignes);
  };

  const handleDeleteLigne = (index: number) => {
    const newLignes = lignes.filter((_, i) => i !== index);
    setLignes(newLignes);
  };

  const handleAddLigne = () => {
    const newLigne: LignePrecommandeComplete = {
      id: `temp-${Date.now()}`,
      precommande_id: precommande.id,
      article_id: '',
      quantite: 1,
      quantite_livree: 0,
      prix_unitaire: 0,
      montant_ligne: 0,
      created_at: new Date().toISOString(),
      statut_ligne: 'en_attente'
    };
    setLignes([...lignes, newLigne]);
  };

  const calculateTotals = () => {
    const montantHT = lignes.reduce((sum, ligne) => sum + ligne.montant_ligne, 0);
    const tva = montantHT * 0.20;
    const montantTTC = montantHT + tva;
    return { montantHT, tva, montantTTC };
  };

  const handleSubmit = () => {
    const totals = calculateTotals();
    onSave({
      ...formData,
      lignes_precommande: lignes,
      montant_ht: totals.montantHT,
      tva: totals.tva,
      montant_ttc: totals.montantTTC,
      reste_a_payer: totals.montantTTC - formData.acompte_verse
    });
  };

  const { montantHT, tva, montantTTC } = calculateTotals();
  const resteAPayer = montantTTC - formData.acompte_verse;

  return (
    <div className="space-y-6">
      {/* Section Informations générales */}
      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="statut">Statut de la précommande</Label>
          <Select 
            value={formData.statut} 
            onValueChange={(value) => setFormData({ ...formData, statut: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmee">🟡 Confirmée</SelectItem>
              <SelectItem value="en_preparation">🔄 En préparation</SelectItem>
              <SelectItem value="prete">🔵 Prête</SelectItem>
              <SelectItem value="partiellement_livree">🟠 Partiellement livrée</SelectItem>
              <SelectItem value="livree">🟢 Livrée</SelectItem>
              <SelectItem value="annulee">❌ Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section Paiement */}
      <div className="border rounded-lg p-4 bg-blue-50">
        <h3 className="font-semibold mb-3 text-blue-800">💳 Gestion des paiements</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="acompte_verse">Acompte versé</Label>
            <Input
              id="acompte_verse"
              type="number"
              step="0.01"
              min="0"
              max={montantTTC}
              value={formData.acompte_verse}
              onChange={(e) => setFormData({ ...formData, acompte_verse: parseFloat(e.target.value) || 0 })}
              placeholder="Montant de l'acompte"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Montant TTC:</span> {formatCurrency(montantTTC)}
            </div>
            <div className="text-sm">
              <span className="font-medium">Acompte versé:</span> {formatCurrency(formData.acompte_verse)}
            </div>
            <div className="text-sm font-bold text-blue-600">
              <span>Reste à payer:</span> {formatCurrency(resteAPayer)}
            </div>
          </div>
        </div>
      </div>

      {/* Articles de la précommande */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Articles de la précommande</h3>
          <Button type="button" variant="outline" size="sm" onClick={handleAddLigne}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un article
          </Button>
        </div>

        <div className="space-y-3">
          {lignes.map((ligne, index) => (
            <div key={ligne.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded">
              <div className="col-span-3">
                <Select 
                  value={ligne.article_id} 
                  onValueChange={(value) => {
                    const article = articles?.find(a => a.id === value);
                    if (article) {
                      handleLigneChange(index, 'article_id', value);
                      handleLigneChange(index, 'prix_unitaire', article.prix_vente || 0);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un article" />
                  </SelectTrigger>
                  <SelectContent>
                    {articles?.map((article) => (
                      <SelectItem key={article.id} value={article.id}>
                        {article.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  min="1"
                  value={ligne.quantite}
                  onChange={(e) => handleLigneChange(index, 'quantite', parseInt(e.target.value) || 1)}
                  placeholder="Qté cmd"
                  title="Quantité commandée"
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  max={ligne.quantite}
                  value={ligne.quantite_livree || 0}
                  onChange={(e) => handleLigneChange(index, 'quantite_livree', parseInt(e.target.value) || 0)}
                  placeholder="Qté livrée"
                  title="Quantité livrée"
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  value={ligne.prix_unitaire}
                  onChange={(e) => handleLigneChange(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                  placeholder="Prix unitaire"
                />
              </div>
              
              <div className="col-span-2 text-right text-sm font-medium">
                {formatCurrency(ligne.montant_ligne)}
              </div>
              
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteLigne(index)}
                  className="text-red-600 hover:text-red-700"
                  title="Supprimer cette ligne"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totaux */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Montant HT:</span>
            <span className="font-semibold">{formatCurrency(montantHT)}</span>
          </div>
          <div className="flex justify-between">
            <span>TVA (20%):</span>
            <span className="font-semibold">{formatCurrency(tva)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-bold">Montant TTC:</span>
            <span className="font-bold text-lg">{formatCurrency(montantTTC)}</span>
          </div>
          <div className="flex justify-between text-blue-600">
            <span className="font-bold">Reste à payer:</span>
            <span className="font-bold">{formatCurrency(resteAPayer)}</span>
          </div>
        </div>
      </div>

      {/* Observations */}
      <div>
        <Label htmlFor="observations">Observations</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          placeholder="Observations sur cette précommande..."
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  );
};

export default EditPrecommandeForm;
