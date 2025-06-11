
import React, { useState } from 'react';
import { usePointsDeVente } from '@/hooks/useStock';
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

const PointsDeVente = () => {
  const { pointsDeVente, isLoading, createPointDeVente, updatePointDeVente, deletePointDeVente } = usePointsDeVente();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPdvId, setCurrentPdvId] = useState<string | null>(null);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    type_pdv: '',
    responsable: '',
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
      const pdv = pointsDeVente?.find(p => p.id === id);
      if (pdv) {
        setFormData({
          nom: pdv.nom,
          adresse: pdv.adresse || '',
          type_pdv: pdv.type_pdv || '',
          responsable: pdv.responsable || '',
          statut: pdv.statut || 'actif'
        });
        setCurrentPdvId(id);
      }
    } else {
      // Mode ajout
      setFormData({
        nom: '',
        adresse: '',
        type_pdv: '',
        responsable: '',
        statut: 'actif'
      });
      setCurrentPdvId(null);
    }
    setIsDialogOpen(true);
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
        // Mise à jour
        await updatePointDeVente.mutateAsync({
          id: currentPdvId,
          nom: formData.nom,
          adresse: formData.adresse || null,
          type_pdv: formData.type_pdv || null,
          responsable: formData.responsable || null,
          statut: formData.statut
        });
      } else {
        // Création
        await createPointDeVente.mutateAsync({
          nom: formData.nom,
          adresse: formData.adresse || null,
          type_pdv: formData.type_pdv || null,
          responsable: formData.responsable || null,
          statut: formData.statut
        });
      }
      setIsDialogOpen(false);
      setFormData({
        nom: '',
        adresse: '',
        type_pdv: '',
        responsable: '',
        statut: 'actif'
      });
      setCurrentPdvId(null);
    } catch (error) {
      console.error("Erreur lors de l'opération sur le point de vente:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePointDeVente.mutateAsync(id);
    } catch (error) {
      console.error("Erreur lors de la suppression du point de vente:", error);
    }
  };

  const filteredPointsDeVente = pointsDeVente?.filter(pdv => 
    pdv.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pdv.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdv.responsable?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Points de Vente</CardTitle>
        <div className="flex space-x-2">
          <Button variant="default" onClick={() => handleAddEdit()}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau point de vente
          </Button>
          <Button variant="outline" size="icon" title="Rafraîchir">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Input
            placeholder="Rechercher un point de vente..."
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
                  <TableHead>Type</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPointsDeVente && filteredPointsDeVente.length > 0 ? (
                  filteredPointsDeVente.map((pdv) => (
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
                      <TableCell>
                        {format(new Date(pdv.updated_at), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleAddEdit(pdv.id)}
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
                    <TableCell colSpan={7} className="text-center py-4">
                      Aucun point de vente trouvé
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
            <DialogTitle>{currentPdvId ? "Modifier le point de vente" : "Ajouter un point de vente"}</DialogTitle>
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

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                name="responsable"
                value={formData.responsable}
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
              <Button type="submit">{currentPdvId ? "Mettre à jour" : "Enregistrer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PointsDeVente;
