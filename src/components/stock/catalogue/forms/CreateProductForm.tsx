
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, Package, Euro, Truck, Shield, Plane, Plus } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useUnites } from '@/hooks/useUnites';
import { formatCurrency } from '@/lib/currency';
import { ImageUpload } from '@/components/ui/image-upload';

interface FormData {
  nom: string;
  description: string;
  prix_achat: string;
  prix_vente: string;
  frais_logistique: string;
  frais_douane: string;
  frais_transport: string;
  autres_frais: string;
  categorie_id: string;
  unite_id: string;
  seuil_alerte: string;
  image_url: string;
}

interface CreateProductFormProps {
  formData: FormData;
  loading: boolean;
  onSubmit: (data: {
    nom?: string;
    reference?: string;
    description?: string;
    prix_achat?: number;
    prix_vente?: number;
    frais_logistique?: number;
    frais_douane?: number;
    frais_transport?: number;
    autres_frais?: number;
    seuil_alerte?: number;
    image_url?: string;
  }) => void;
  onFormDataChange: (updates: Partial<FormData>) => void;
  onCancel: () => void;
  isEditMode?: boolean;
}

const CreateProductForm = ({ 
  formData, 
  loading, 
  onSubmit, 
  onFormDataChange, 
  onCancel,
  isEditMode = false
}: CreateProductFormProps) => {
  const { data: categories } = useCategories();
  const { data: unites } = useUnites();

  // Calculs de marge en temps réel
  const prixAchat = parseFloat(formData.prix_achat) || 0;
  const fraisLogistique = parseFloat(formData.frais_logistique) || 0;
  const fraisDouane = parseFloat(formData.frais_douane) || 0;
  const fraisTransport = parseFloat(formData.frais_transport) || 0;
  const autresFrais = parseFloat(formData.autres_frais) || 0;
  const coutTotal = prixAchat + fraisLogistique + fraisDouane + fraisTransport + autresFrais;
  const prixVente = parseFloat(formData.prix_vente) || 0;
  const marge = prixVente - coutTotal;
  const tauxMarge = coutTotal > 0 ? (marge / coutTotal) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      nom: formData.nom,
      description: formData.description,
      prix_achat: prixAchat || undefined,
      prix_vente: prixVente || undefined,
      frais_logistique: fraisLogistique || undefined,
      frais_douane: fraisDouane || undefined,
      frais_transport: fraisTransport || undefined,
      autres_frais: autresFrais || undefined,
      seuil_alerte: parseInt(formData.seuil_alerte) || undefined,
      image_url: formData.image_url || undefined,
    };
    
    onSubmit(submitData);
  };

  const handleImageUploaded = (url: string) => {
    onFormDataChange({ image_url: url });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <h3 className="font-medium">Informations produit</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nom">Nom du produit *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => onFormDataChange({ nom: e.target.value })}
              placeholder="Nom du produit"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="seuil_alerte">Seuil d'alerte</Label>
            <Input
              id="seuil_alerte"
              type="number"
              value={formData.seuil_alerte}
              onChange={(e) => onFormDataChange({ seuil_alerte: e.target.value })}
              placeholder="10"
              min="0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Description du produit"
            rows={3}
          />
        </div>

        <div>
          <ImageUpload
            onImageUploaded={handleImageUploaded}
            currentImageUrl={formData.image_url}
            label="Image du produit"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categorie">Catégorie</Label>
            <Select value={formData.categorie_id} onValueChange={(value) => onFormDataChange({ categorie_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="unite">Unité de mesure</Label>
            <Select value={formData.unite_id} onValueChange={(value) => onFormDataChange({ unite_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une unité" />
              </SelectTrigger>
              <SelectContent>
                {unites?.map((unite) => (
                  <SelectItem key={unite.id} value={unite.id}>
                    {unite.nom} ({unite.symbole})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Prix et coûts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Euro className="h-4 w-4" />
          <h3 className="font-medium">Prix et coûts</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prix_achat">Prix d'achat unitaire</Label>
            <Input
              id="prix_achat"
              type="number"
              step="0.01"
              min="0"
              value={formData.prix_achat}
              onChange={(e) => onFormDataChange({ prix_achat: e.target.value })}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="prix_vente">Prix de vente unitaire</Label>
            <Input
              id="prix_vente"
              type="number"
              step="0.01"
              min="0"
              value={formData.prix_vente}
              onChange={(e) => onFormDataChange({ prix_vente: e.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Frais additionnels */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <h3 className="font-medium">Frais additionnels</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="frais_logistique" className="flex items-center gap-2">
              <Package className="h-3 w-3" />
              Frais logistique
            </Label>
            <Input
              id="frais_logistique"
              type="number"
              step="0.01"
              min="0"
              value={formData.frais_logistique}
              onChange={(e) => onFormDataChange({ frais_logistique: e.target.value })}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="frais_douane" className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Frais de douane
            </Label>
            <Input
              id="frais_douane"
              type="number"
              step="0.01"
              min="0"
              value={formData.frais_douane}
              onChange={(e) => onFormDataChange({ frais_douane: e.target.value })}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="frais_transport" className="flex items-center gap-2">
              <Plane className="h-3 w-3" />
              Frais de transport
            </Label>
            <Input
              id="frais_transport"
              type="number"
              step="0.01"
              min="0"
              value={formData.frais_transport}
              onChange={(e) => onFormDataChange({ frais_transport: e.target.value })}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="autres_frais" className="flex items-center gap-2">
              <Plus className="h-3 w-3" />
              Autres frais
            </Label>
            <Input
              id="autres_frais"
              type="number"
              step="0.01"
              min="0"
              value={formData.autres_frais}
              onChange={(e) => onFormDataChange({ autres_frais: e.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Calculs de marge */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          <h3 className="font-medium">Calculs de marge</h3>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Coût total unitaire :</span>
            <span className="font-medium">{formatCurrency(coutTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Marge unitaire :</span>
            <span className={`font-medium ${marge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(marge)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Taux de marge :</span>
            <span className={`font-medium ${tauxMarge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {tauxMarge.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading || !formData.nom}>
          {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier le produit' : 'Créer le produit')}
        </Button>
      </div>
    </form>
  );
};

export default CreateProductForm;
