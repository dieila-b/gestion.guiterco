
import React, { useState } from 'react';
import { usePointsDeVente } from '@/hooks/stock';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Store, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
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

const DepotsPDV = () => {
  const { pointsDeVente, isLoading, createPointDeVente, updatePointDeVente, deletePointDeVente } = usePointsDeVente();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPdvId, setCurrentPdvId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    nom: '', 
    adresse: '', 
    responsable: '', 
    type_pdv: '',
    statut: 'actif'
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du point de vente est obligatoire",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentPdvId) {
        await updatePointDeVente.mutateAsync({
          id: currentPdvId,
          nom: formData.nom,
          adresse: formData.adresse || null,
          responsable: formData.responsable || null,
          type_pdv: formData.type_pdv || null,
          statut: formData.statut
        });
      } else {
        await createPointDeVente.mutateAsync({
          nom: formData.nom,
          adresse: formData.adresse || null,
          responsable: formData.responsable || null,
          type_pdv: formData.type_pdv || null,
          statut: formData.statut
        });
      }
      setIsDialogOpen(false);
      setFormData({ nom: '', adresse: '', responsable: '', type_pdv: '', statut: 'actif' });
      setCurrentPdvId(null);
    } catch (error) {
      console.error("Erreur lors de l'opération sur le point de vente:", error);
    }
  };

  const handleEdit = (pdv: any) => {
    setCurrentPdvId(pdv.id);
    setFormData({ 
      nom: pdv.nom, 
      adresse: pdv.adresse || '', 
      responsable: pdv.responsable || '', 
      type_pdv: pdv.type_pdv || '',
      statut: pdv.statut || 'actif'
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setCurrentPdvId(null);
    setFormData({ nom: '', adresse: '', responsable: '', type_pdv: '', statut: 'actif' });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePointDeVente.mutateAsync(id);
    } catch (error) {
      console.error("Erreur lors de la suppression du point de vente:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <div>
                <CardTitle>Dépôts PDV</CardTitle>
                <CardDescription>
                  Gérez vos points de vente
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un PDV
              </Button>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointsDeVente && pointsDeVente.length > 0 ? (
                    pointsDeVente.map((pdv) => (
                      <TableRow key={pdv.id}>
                        <TableCell className="font-medium">{pdv.nom}</TableCell>
                        <TableCell>{pdv.adresse || 'N/A'}</TableCell>
                        <TableCell>{pdv.type_pdv || 'N/A'}</TableCell>
                        <TableCell>{pdv.responsable || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            pdv.statut === 'actif' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {pdv.statut || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(pdv)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer ce point de vente ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(pdv.id)}
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
                        Aucun point de vente trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPdvId ? 'Modifier le point de vente' : 'Ajouter un point de vente'}
            </DialogTitle>
            <DialogDescription>
              Saisissez les informations du point de vente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom du point de vente *</Label>
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
              <Label htmlFor="type_pdv">Type de point de vente</Label>
              <Select 
                value={formData.type_pdv} 
                onValueChange={(value) => handleSelectChange('type_pdv', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boutique">Boutique</SelectItem>
                  <SelectItem value="marche">Marché</SelectItem>
                  <SelectItem value="supermarche">Supermarché</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                name="responsable"
                value={formData.responsable}
                onChange={handleInputChange}
              />
            </div>
            <div>
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
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {currentPdvId ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepotsPDV;
