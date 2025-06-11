
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useUnites } from '@/hooks/useUnites';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';

const CreateProductDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: categories } = useCategories();
  const { data: unites } = useUnites();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix_achat: '',
    prix_vente: '',
    categorie_id: '',
    unite_id: '',
    seuil_alerte: '10',
    image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insérer avec une référence temporaire que le trigger remplacera
      const { error } = await supabase
        .from('catalogue')
        .insert({
          nom: formData.nom,
          reference: 'TEMP', // Référence temporaire - sera remplacée par le trigger
          description: formData.description || null,
          prix_achat: formData.prix_achat ? parseFloat(formData.prix_achat) : null,
          prix_vente: formData.prix_vente ? parseFloat(formData.prix_vente) : null,
          categorie_id: formData.categorie_id || null,
          unite_id: formData.unite_id || null,
          seuil_alerte: parseInt(formData.seuil_alerte),
          image_url: formData.image_url || null
        });

      if (error) throw error;

      toast({
        title: "Produit créé",
        description: "Le produit a été ajouté au catalogue avec succès."
      });

      setFormData({
        nom: '',
        description: '',
        prix_achat: '',
        prix_vente: '',
        categorie_id: '',
        unite_id: '',
        seuil_alerte: '10',
        image_url: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Produit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau produit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom du produit *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
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
            onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
            currentImageUrl={formData.image_url}
          />

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, prix_achat: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="prix_vente">Prix unitaire de vente (GNF)</Label>
            <Input
              id="prix_vente"
              type="number"
              step="0.01"
              value={formData.prix_vente}
              onChange={(e) => setFormData({ ...formData, prix_vente: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="categorie">Catégorie</Label>
            <Select value={formData.categorie_id} onValueChange={(value) => setFormData({ ...formData, categorie_id: value })}>
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
            <Select value={formData.unite_id} onValueChange={(value) => setFormData({ ...formData, unite_id: value })}>
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
              onChange={(e) => setFormData({ ...formData, seuil_alerte: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductDialog;
