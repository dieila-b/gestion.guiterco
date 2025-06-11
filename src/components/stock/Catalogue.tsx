
import React, { useState } from 'react';
import { useCatalogue } from '@/hooks/useStock';
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

const Catalogue = () => {
  const { articles, isLoading, createArticle, updateArticle, deleteArticle } = useCatalogue();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    reference: '',
    nom: '',
    description: '',
    categorie: '',
    unite_mesure: '',
    prix_unitaire: '',
    seuil_alerte: '10',
    statut: 'actif'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEdit = (id?: string) => {
    if (id) {
      // Mode édition
      const article = articles?.find(a => a.id === id);
      if (article) {
        setFormData({
          reference: article.reference,
          nom: article.nom,
          description: article.description || '',
          categorie: article.categorie || '',
          unite_mesure: article.unite_mesure || '',
          prix_unitaire: article.prix_unitaire?.toString() || '',
          seuil_alerte: article.seuil_alerte?.toString() || '10',
          statut: article.statut || 'actif'
        });
        setCurrentArticleId(id);
      }
    } else {
      // Mode ajout
      setFormData({
        reference: '',
        nom: '',
        description: '',
        categorie: '',
        unite_mesure: '',
        prix_unitaire: '',
        seuil_alerte: '10',
        statut: 'actif'
      });
      setCurrentArticleId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reference || !formData.nom) {
      toast({
        title: "Erreur de validation",
        description: "La référence et le nom de l'article sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentArticleId) {
        // Mise à jour
        await updateArticle.mutateAsync({
          id: currentArticleId,
          reference: formData.reference,
          nom: formData.nom,
          description: formData.description || null,
          categorie: formData.categorie || null,
          unite_mesure: formData.unite_mesure || null,
          prix_unitaire: formData.prix_unitaire ? parseFloat(formData.prix_unitaire) : null,
          seuil_alerte: formData.seuil_alerte ? parseInt(formData.seuil_alerte) : 10,
          statut: formData.statut
        });
      } else {
        // Création
        await createArticle.mutateAsync({
          reference: formData.reference,
          nom: formData.nom,
          description: formData.description || null,
          categorie: formData.categorie || null,
          unite_mesure: formData.unite_mesure || null,
          prix_unitaire: formData.prix_unitaire ? parseFloat(formData.prix_unitaire) : null,
          seuil_alerte: formData.seuil_alerte ? parseInt(formData.seuil_alerte) : 10,
          statut: formData.statut
        });
      }
      setIsDialogOpen(false);
      setFormData({
        reference: '',
        nom: '',
        description: '',
        categorie: '',
        unite_mesure: '',
        prix_unitaire: '',
        seuil_alerte: '10',
        statut: 'actif'
      });
      setCurrentArticleId(null);
    } catch (error) {
      console.error("Erreur lors de l'opération sur l'article:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArticle.mutateAsync(id);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article:", error);
    }
  };

  const filteredArticles = articles?.filter(article => 
    article.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
    article.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Catalogue des Articles</CardTitle>
        <div className="flex space-x-2">
          <Button variant="default" onClick={() => handleAddEdit()}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Button>
          <Button variant="outline" size="icon" title="Rafraîchir">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Input
            placeholder="Rechercher un article..."
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
                  <TableHead>Référence</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Seuil d'alerte</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles && filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>{article.reference}</TableCell>
                      <TableCell className="font-medium">{article.nom}</TableCell>
                      <TableCell>{article.categorie || 'N/A'}</TableCell>
                      <TableCell>{article.unite_mesure || 'N/A'}</TableCell>
                      <TableCell className="text-right">{article.prix_unitaire?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell className="text-right">{article.seuil_alerte || 10}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          article.statut === 'actif' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {article.statut || 'actif'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleAddEdit(article.id)}
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
                                  Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(article.id)}
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
                    <TableCell colSpan={8} className="text-center py-4">
                      Aucun article trouvé
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentArticleId ? "Modifier l'article" : "Ajouter un article"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Référence *</Label>
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  required
                />
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <Select 
                  value={formData.categorie} 
                  onValueChange={(value) => handleSelectChange('categorie', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produit_fini">Produit fini</SelectItem>
                    <SelectItem value="matiere_premiere">Matière première</SelectItem>
                    <SelectItem value="consommable">Consommable</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unite_mesure">Unité de mesure</Label>
                <Select 
                  value={formData.unite_mesure} 
                  onValueChange={(value) => handleSelectChange('unite_mesure', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Pièce</SelectItem>
                    <SelectItem value="kg">Kilogramme</SelectItem>
                    <SelectItem value="litre">Litre</SelectItem>
                    <SelectItem value="metre">Mètre</SelectItem>
                    <SelectItem value="carton">Carton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prix_unitaire">Prix unitaire</Label>
                <Input
                  id="prix_unitaire"
                  name="prix_unitaire"
                  type="number"
                  step="0.01"
                  value={formData.prix_unitaire}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seuil_alerte">Seuil d'alerte</Label>
                <Input
                  id="seuil_alerte"
                  name="seuil_alerte"
                  type="number"
                  value={formData.seuil_alerte}
                  onChange={handleInputChange}
                />
              </div>
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
              <Button type="submit">{currentArticleId ? "Mettre à jour" : "Enregistrer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Catalogue;
