
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Warehouse, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useEntrepots } from "@/hooks/useStock";
import { Skeleton } from "@/components/ui/skeleton";
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

const DepotsStockage = () => {
  const { entrepots, isLoading, createEntrepot, updateEntrepot, deleteEntrepot } = useEntrepots();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    nom: '', 
    adresse: '', 
    capacite_max: '', 
    gestionnaire: '', 
    statut: 'actif' 
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, statut: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du dépôt est obligatoire",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingDepot) {
        // Mise à jour
        await updateEntrepot.mutateAsync({
          id: editingDepot.id,
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
      setFormData({ nom: '', adresse: '', capacite_max: '', gestionnaire: '', statut: 'actif' });
      setEditingDepot(null);
    } catch (error) {
      console.error("Erreur lors de l'opération sur l'entrepôt:", error);
    }
  };

  const handleEdit = (depot: any) => {
    setEditingDepot(depot);
    setFormData({ 
      nom: depot.nom, 
      adresse: depot.adresse || '', 
      capacite_max: depot.capacite_max?.toString() || '', 
      gestionnaire: depot.gestionnaire || '',
      statut: depot.statut || 'actif'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntrepot.mutateAsync(id);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entrepôt:", error);
    }
  };

  const handleAddNew = () => {
    setEditingDepot(null);
    setFormData({ nom: '', adresse: '', capacite_max: '', gestionnaire: '', statut: 'actif' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Warehouse className="h-5 w-5" />
              <div>
                <CardTitle>Dépôts de Stockage</CardTitle>
                <CardDescription>
                  Gérez vos entrepôts et zones de stockage
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un dépôt
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDepot ? 'Modifier le dépôt' : 'Ajouter un dépôt de stockage'}
                    </DialogTitle>
                    <DialogDescription>
                      Saisissez les informations du dépôt de stockage
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nom">Nom du dépôt *</Label>
                      <Input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="adresse">Adresse</Label>
                      <Input
                        id="adresse"
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="capacite_max">Capacité maximum</Label>
                      <Input
                        id="capacite_max"
                        name="capacite_max"
                        type="number"
                        value={formData.capacite_max}
                        onChange={handleInputChange}
                        placeholder="ex: 1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gestionnaire">Responsable</Label>
                      <Input
                        id="gestionnaire"
                        name="gestionnaire"
                        value={formData.gestionnaire}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="statut">Statut</Label>
                      <Select value={formData.statut} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="actif">Actif</SelectItem>
                          <SelectItem value="inactif">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingDepot ? 'Modifier' : 'Ajouter'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="icon" title="Rafraîchir">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entrepots && entrepots.length > 0 ? (
                  entrepots.map((depot) => (
                    <TableRow key={depot.id}>
                      <TableCell className="font-medium">{depot.nom}</TableCell>
                      <TableCell>{depot.adresse || 'N/A'}</TableCell>
                      <TableCell>{depot.capacite_max || 'N/A'}</TableCell>
                      <TableCell>{depot.gestionnaire || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          depot.statut === 'actif' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {depot.statut || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(depot)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer ce dépôt ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(depot.id)}
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
                    <TableCell colSpan={6} className="text-center py-4">
                      Aucun dépôt trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepotsStockage;
