
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCategories } from '@/hooks/useCategories';
import { useUnites } from '@/hooks/useUnites';
import { ArticleOptimized } from '@/hooks/useCatalogueOptimized';

interface EditProductDialogProps {
  article: ArticleOptimized;
}

export const EditProductDialog = ({ article }: EditProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: article.nom,
    reference: article.reference,
    description: '',
    prix_achat: article.prix_achat || 0,
    prix_vente: article.prix_vente || 0,
    categorie: article.categorie || '',
    unite_mesure: '',
    seuil_alerte: 10
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { data: unites } = useUnites();

  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('catalogue')
        .update(data)
        .eq('id', article.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      queryClient.invalidateQueries({ queryKey: ['catalogue_optimized'] });
      toast({
        title: "Produit mis à jour",
        description: "Le produit a été mis à jour avec succès.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProductMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        title="Éditer"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Éditer le produit</DialogTitle>
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
            <Label htmlFor="reference">Référence</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Laisser vide pour génération automatique"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prix_achat">Prix d'achat (GNF)</Label>
              <Input
                id="prix_achat"
                type="number"
                value={formData.prix_achat}
                onChange={(e) => setFormData({ ...formData, prix_achat: Number(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="prix_vente">Prix de vente (GNF)</Label>
              <Input
                id="prix_vente"
                type="number"
                value={formData.prix_vente}
                onChange={(e) => setFormData({ ...formData, prix_vente: Number(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="categorie">Catégorie</Label>
            <Select
              value={formData.categorie}
              onValueChange={(value) => setFormData({ ...formData, categorie: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.nom}>
                    {cat.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="unite">Unité de mesure</Label>
            <Select
              value={formData.unite_mesure}
              onValueChange={(value) => setFormData({ ...formData, unite_mesure: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une unité" />
              </SelectTrigger>
              <SelectContent>
                {unites?.map((unite) => (
                  <SelectItem key={unite.id} value={unite.nom}>
                    {unite.nom} ({unite.symbole})
                  </SelectItem>
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
              onChange={(e) => setFormData({ ...formData, seuil_alerte: Number(e.target.value) })}
              min="0"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
