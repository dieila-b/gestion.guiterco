
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';
import { useUnites } from '@/hooks/useUnites';
import { ImageUpload } from '@/components/ui/image-upload';

interface FormData {
  nom: string;
  description: string;
  prix_achat: string;
  prix_vente: string;
  categorie_id: string;
  unite_id: string;
  seuil_alerte: string;
  image_url: string;
}

interface CreateProductFormProps {
  formData: FormData;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  onFormDataChange: (updates: Partial<FormData>) => void;
  onCancel: () => void;
}

const CreateProductForm = ({ 
  formData, 
  loading, 
  onSubmit, 
  onFormDataChange, 
  onCancel 
}: CreateProductFormProps) => {
  const { data: categories } = useCategories();
  const { data: unites } = useUnites();

  const handleSubmit = async (e: React.FormEvent) => {
    const success = await onSubmit(e);
    if (success) {
      onCancel(); // Close dialog on success
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nom">Nom du produit *</Label>
        <Input
          id="nom"
          value={formData.nom}
          onChange={(e) => onFormDataChange({ nom: e.target.value })}
          required
        />
      </div>

      <div>
        <Label className="text-sm text-gray-500">Référence</Label>
        <Input
          value="Générée automatiquement"
          disabled
          className="bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          La référence sera générée automatiquement (ex: REF000001)
        </p>
      </div>

      <ImageUpload
        onImageUploaded={(url) => onFormDataChange({ image_url: url })}
        currentImageUrl={formData.image_url}
      />

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="prix_achat">Prix unitaire d'achat (GNF)</Label>
        <Input
          id="prix_achat"
          type="number"
          step="0.01"
          value={formData.prix_achat}
          onChange={(e) => onFormDataChange({ prix_achat: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="prix_vente">Prix unitaire de vente (GNF)</Label>
        <Input
          id="prix_vente"
          type="number"
          step="0.01"
          value={formData.prix_vente}
          onChange={(e) => onFormDataChange({ prix_vente: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="categorie">Catégorie</Label>
        <Select value={formData.categorie_id} onValueChange={(value) => onFormDataChange({ categorie_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="unite">Unité de mesure</Label>
        <Select value={formData.unite_id} onValueChange={(value) => onFormDataChange({ unite_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une unité" />
          </SelectTrigger>
          <SelectContent>
            {unites?.map((unite) => (
              <SelectItem key={unite.id} value={unite.id}>{unite.nom} ({unite.symbole})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="seuil_alerte">Seuil d'alerte</Label>
        <Input
          id="seuil_alerte"
          type="number"
          value={formData.seuil_alerte}
          onChange={(e) => onFormDataChange({ seuil_alerte: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default CreateProductForm;
