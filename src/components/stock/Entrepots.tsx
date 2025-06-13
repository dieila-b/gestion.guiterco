import React, { useState } from 'react';
import { useEntrepots } from '@/hooks/stock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Entrepots = () => {
  const { entrepots, isLoading, createEntrepot, updateEntrepot, deleteEntrepot } = useEntrepots();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntrepotId, setCurrentEntrepotId] = useState<string | null>(null);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    capacite_max: '',
    gestionnaire: '',
    statut: 'actif'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEdit = (id?: string) => {
    if (id) {
      // Mode édition
      const entrepot = entrepots?.find(e => e.id === id);
      if (entrepot) {
        setFormData({
          nom: entrepot.nom,
          adresse: entrepot.adresse || '',
          capacite_max: entrepot.capacite_max?.toString() || '',
          gestionnaire: entrepot.gestionnaire || '',
          statut: entrepot.statut || 'actif'
        });
        setCurrentEntrepotId(id);
      }
    } else {
      // Mode ajout
      setFormData({
        nom: '',
        adresse: '',
        capacite_max: '',
        gestionnaire: '',
        statut: 'actif'
      });
      setCurrentEntrepotId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom) {
      toast({
        title: "Erreur de validation",
        description: "Le nom de l'entrepôt est obligatoire",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentEntrepotId) {
        // Mise à jour
        await updateEntrepot.mutateAsync({
          id: currentEntrepotId,
          nom: formData.nom,
          adresse: formData.adresse || null,
          capacite_max: formData.capacite_max ? parseInt(formData.capacite_max) : null,
          gestionnaire: formData.gestionnaire || null,
          statut: formData.statut
        });
      } else {
        // Création
        await createEntrepot.mutateAsync({
          nom: formData.nom,
          adresse: formData.adresse || null,
          capacite_max: formData.capacite_max ? parseInt(formData.capacite_max) : null,
          gestionnaire: formData.gestionnaire || null,
          statut: formData.statut
        });
      }
      setIsDialogOpen(false);
      setFormData({
        nom: '',
        adresse: '',
        capacite_max: '',
        gestionnaire: '',
        statut: 'actif'
      });
      setCurrentEntrepotId(null);
    } catch (error) {
      console.error("Erreur lors de l'opération sur l'entrepôt:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntrepot.mutateAsync(id);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entrepôt:", error);
    }
  };

  const filteredEntrepots = entrepots?.filter(entrepot => 
    entrepot.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entrepot.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entrepot.gestionnaire?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Entrepôts</CardTitle>
        <div className="flex space-x-2">
          <Button variant="default" onClick={() => handleAddEdit()}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel entrepôt
          </Button>
          <Button variant="outline" size="icon" title="Rafraîchir">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Input
            placeholder="Rechercher un entrepôt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Gestionnaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntrepots && filteredEntrepots.length > 0 ? (
                  filteredEntrepots.map((entrepot) => (
                    <TableRow key={entrepot.id}>
                      <TableCell className="font-medium">{entrepot.nom}</TableCell>
                      <TableCell>{entrepot.adresse || 'N/A'}</TableCell>
                      <TableCell>{entrepot.capacite_max || 'N/A'}</TableCell>
                      <TableCell>{entrepot.gestionnaire || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entrepot.statut === 'actif' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {entrepot.statut || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(entrepot.updated_at), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleAddEdit(entrepot.id)}
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cet entrepôt ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(entrepot.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Aucun entrepôt trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Modal d'ajout/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentEntrepotId ? "Modifier l'entrepôt" : "Ajouter un entrepôt"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacite_max">Capacité maximum</Label>
              <Input
                id="capacite_max"
                name="capacite_max"
                type="number"
                value={formData.capacite_max}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gestionnaire">Gestionnaire</Label>
              <Input
                id="gestionnaire"
                name="gestionnaire"
                value={formData.gestionnaire}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select 
                value={formData.statut} 
                onValueChange={(value) => handleSelectChange('statut', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">{currentEntrepotId ? "Mettre à jour" : "Enregistrer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Entrepots;
