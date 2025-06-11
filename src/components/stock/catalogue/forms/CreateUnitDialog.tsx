
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCreateUnite } from '@/hooks/useUnites';
import { useToast } from '@/hooks/use-toast';

const CreateUnitDialog = () => {
  const [open, setOpen] = useState(false);
  const createUnite = useCreateUnite();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nom: '',
    symbole: '',
    type_unite: 'quantite'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUnite.mutateAsync({
        nom: formData.nom,
        symbole: formData.symbole,
        type_unite: formData.type_unite,
        statut: 'actif'
      });

      toast({
        title: "Unité créée",
        description: "L'unité de mesure a été ajoutée avec succès."
      });

      setFormData({
        nom: '',
        symbole: '',
        type_unite: 'quantite'
      });
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création de l\'unité:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'unité de mesure.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Unité
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle unité</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom de l'unité *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="ex: Kilogramme"
              required
            />
          </div>

          <div>
            <Label htmlFor="symbole">Symbole *</Label>
            <Input
              id="symbole"
              value={formData.symbole}
              onChange={(e) => setFormData({ ...formData, symbole: e.target.value })}
              placeholder="ex: kg"
              required
            />
          </div>

          <div>
            <Label htmlFor="type_unite">Type d'unité</Label>
            <Select value={formData.type_unite} onValueChange={(value) => setFormData({ ...formData, type_unite: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantite">Quantité</SelectItem>
                <SelectItem value="poids">Poids</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="longueur">Longueur</SelectItem>
                <SelectItem value="surface">Surface</SelectItem>
                <SelectItem value="emballage">Emballage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createUnite.isPending}>
              {createUnite.isPending ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUnitDialog;
