
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCreateCategorie } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';

const CreateCategoryDialog = () => {
  const [open, setOpen] = useState(false);
  const createCategorie = useCreateCategorie();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    couleur: '#6366f1'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCategorie.mutateAsync({
        nom: formData.nom,
        description: formData.description || null,
        couleur: formData.couleur,
        statut: 'actif'
      });

      toast({
        title: "Catégorie créée",
        description: "La catégorie a été ajoutée avec succès."
      });

      setFormData({
        nom: '',
        description: '',
        couleur: '#6366f1'
      });
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Catégorie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
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
            <Button type="submit" disabled={createCategorie.isPending}>
              {createCategorie.isPending ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
