
import React, { useState } from 'react';
import { useCatalogue, useEntrepots, usePointsDeVente, useEntreesStock } from '@/hooks/stock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface AddEntreeFormProps {
  onSuccess: () => void;
}

export const AddEntreeForm = ({ onSuccess }: AddEntreeFormProps) => {
  const { createEntree } = useEntreesStock();
  const { articles } = useCatalogue();
  const { entrepots } = useEntrepots();
  const { pointsDeVente } = usePointsDeVente();

  const [formData, setFormData] = useState({
    article_id: '',
    entrepot_id: '',
    point_vente_id: '',
    emplacement_type: 'entrepot',
    quantite: 0,
    type_entree: 'achat',
    numero_bon: '',
    fournisseur: '',
    prix_unitaire: 0,
    observations: '',
    created_by: 'Utilisateur'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset l'autre champ d'emplacement quand on change le type
      if (name === 'emplacement_type') {
        newData.entrepot_id = '';
        newData.point_vente_id = '';
      }
      
      return newData;
    });
  };

  const handleEmplacementChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      entrepot_id: prev.emplacement_type === 'entrepot' ? value : '',
      point_vente_id: prev.emplacement_type === 'point_vente' ? value : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.article_id || formData.quantite <= 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (!formData.entrepot_id && !formData.point_vente_id) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner un emplacement",
        variant: "destructive",
      });
      return;
    }

    try {
      const entreeData = {
        article_id: formData.article_id,
        entrepot_id: formData.entrepot_id || null,
        point_vente_id: formData.point_vente_id || null,
        quantite: Number(formData.quantite),
        type_entree: formData.type_entree,
        numero_bon: formData.numero_bon || null,
        fournisseur: formData.fournisseur || null,
        prix_unitaire: formData.prix_unitaire ? Number(formData.prix_unitaire) : null,
        observations: formData.observations || null,
        created_by: formData.created_by
      };

      await createEntree.mutateAsync(entreeData);
      onSuccess();
      setFormData({
        article_id: '',
        entrepot_id: '',
        point_vente_id: '',
        emplacement_type: 'entrepot',
        quantite: 0,
        type_entree: 'achat',
        numero_bon: '',
        fournisseur: '',
        prix_unitaire: 0,
        observations: '',
        created_by: 'Utilisateur'
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout d'entrée:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="article_id">Article *</Label>
          <Select 
            value={formData.article_id} 
            onValueChange={(value) => handleSelectChange('article_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {articles?.map(article => (
                <SelectItem key={article.id} value={article.id}>
                  {article.reference} - {article.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="emplacement_type">Type d'emplacement *</Label>
          <Select 
            value={formData.emplacement_type} 
            onValueChange={(value) => handleSelectChange('emplacement_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrepot">Entrepôt</SelectItem>
              <SelectItem value="point_vente">Point de vente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emplacement">Emplacement *</Label>
        <Select 
          value={formData.emplacement_type === 'entrepot' ? formData.entrepot_id : formData.point_vente_id}
          onValueChange={handleEmplacementChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un emplacement..." />
          </SelectTrigger>
          <SelectContent>
            {formData.emplacement_type === 'entrepot' ? (
              entrepots?.map(entrepot => (
                <SelectItem key={entrepot.id} value={entrepot.id}>
                  {entrepot.nom}
                </SelectItem>
              ))
            ) : (
              pointsDeVente?.map(pdv => (
                <SelectItem key={pdv.id} value={pdv.id}>
                  {pdv.nom}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantite">Quantité *</Label>
          <Input
            id="quantite"
            name="quantite"
            type="number"
            value={formData.quantite}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type_entree">Type d'entrée *</Label>
          <Select 
            value={formData.type_entree} 
            onValueChange={(value) => handleSelectChange('type_entree', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="achat">Achat</SelectItem>
              <SelectItem value="retour">Retour</SelectItem>
              <SelectItem value="transfert">Transfert</SelectItem>
              <SelectItem value="correction">Correction</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero_bon">Numéro de bon</Label>
          <Input
            id="numero_bon"
            name="numero_bon"
            value={formData.numero_bon}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fournisseur">Fournisseur</Label>
          <Input
            id="fournisseur"
            name="fournisseur"
            value={formData.fournisseur}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prix_unitaire">Prix unitaire (GNF)</Label>
        <Input
          id="prix_unitaire"
          name="prix_unitaire"
          type="number"
          step="1"
          value={formData.prix_unitaire}
          onChange={handleInputChange}
          placeholder="Prix en GNF"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observations</Label>
        <Input
          id="observations"
          name="observations"
          value={formData.observations}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Annuler
        </Button>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  );
};
