
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreateCategorieFinanciere } from "@/hooks/useCategoriesFinancieres";
import { useToast } from "@/hooks/use-toast";

const CreateCategorieDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [type, setType] = useState<'entree' | 'sortie'>('sortie');
  const [couleur, setCouleur] = useState("#6366f1");
  const [description, setDescription] = useState("");

  const createCategorie = useCreateCategorieFinanciere();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createCategorie.mutateAsync({
        nom,
        type,
        couleur,
        description,
      });
      
      toast({
        title: "Catégorie créée",
        description: "La catégorie a été créée avec succès",
      });
      
      setOpen(false);
      // Reset form
      setNom("");
      setType('sortie');
      setCouleur("#6366f1");
      setDescription("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle catégorie financière</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de la catégorie</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Fournitures bureau"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value: 'entree' | 'sortie') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entree">Entrée</SelectItem>
                <SelectItem value="sortie">Sortie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="couleur">Couleur</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="couleur"
                type="color"
                value={couleur}
                onChange={(e) => setCouleur(e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={couleur}
                onChange={(e) => setCouleur(e.target.value)}
                placeholder="#6366f1"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnelle)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la catégorie..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={createCategorie.isPending} className="flex-1">
              {createCategorie.isPending ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategorieDialog;
