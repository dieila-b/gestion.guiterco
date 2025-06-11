
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { useUpdateCategorie, type Categorie } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';

interface EditCategoryDialogProps {
  categorie: Categorie;
}

const EditCategoryDialog = ({ categorie }: EditCategoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const updateCategorie = useUpdateCategorie();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nom: categorie.nom,
    description: categorie.description || '',
    couleur: categorie.couleur
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateCategorie.mutateAsync({
        id: categorie.id,
        nom: formData.nom,
        description: formData.description || null,
        couleur: formData.couleur
      });

      toast({
        title: "Catégorie modifiée",
        description: "La catégorie a été mise à jour avec succès."
      });

      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la modification de la catégorie:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la catégorie.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la catégorie</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom de la catégorie *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
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

          <div>
            <Label htmlFor="couleur">Couleur</Label>
            <div className="flex items-center gap-2">
              <Input
                id="couleur"
                type="color"
                value={formData.couleur}
                onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={formData.couleur}
                onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                placeholder="#6366f1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateCategorie.isPending}>
              {updateCategorie.isPending ? 'Modification...' : 'Modifier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
