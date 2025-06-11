
import React, { useState } from 'react';
import { useSortiesStock, useCatalogue, useEntrepots } from '@/hooks/useStock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const Sorties = () => {
  const { sorties, isLoading, createSortie } = useSortiesStock();
  const { articles } = useCatalogue();
  const { entrepots } = useEntrepots();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    article_id: '',
    entrepot_id: '',
    quantite: 0,
    type_sortie: 'vente',
    destination: '',
    numero_bon: '',
    observations: '',
    created_by: 'Utilisateur'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.article_id || !formData.entrepot_id || formData.quantite <= 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSortie.mutateAsync({
        ...formData,
        quantite: Number(formData.quantite)
      });
      setIsDialogOpen(false);
      setFormData({
        article_id: '',
        entrepot_id: '',
        quantite: 0,
        type_sortie: 'vente',
        destination: '',
        numero_bon: '',
        observations: '',
        created_by: 'Utilisateur'
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de sortie:", error);
    }
  };

  const filteredSorties = sorties?.filter(sortie => 
    sortie.article?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sortie.article?.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sortie.entrepot?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sortie.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Sorties de Stock</CardTitle>
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle sortie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter une sortie de stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="article_id">Article *</Label>
                    <Select 
                      value={formData.article_id} 
                      onValueChange={(value) => handleSelectChange('article_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {articles?.map(article => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.reference} - {article.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entrepot_id">Entrepôt *</Label>
                    <Select 
                      value={formData.entrepot_id} 
                      onValueChange={(value) => handleSelectChange('entrepot_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {entrepots?.map(entrepot => (
                          <SelectItem key={entrepot.id} value={entrepot.id}>
                            {entrepot.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantite">Quantité *</Label>
                    <Input
                      id="quantite"
                      name="quantite"
                      type="number"
                      value={formData.quantite}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type_sortie">Type de sortie *</Label>
                    <Select 
                      value={formData.type_sortie} 
                      onValueChange={(value) => handleSelectChange('type_sortie', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vente">Vente</SelectItem>
                        <SelectItem value="transfert">Transfert</SelectItem>
                        <SelectItem value="perte">Perte</SelectItem>
                        <SelectItem value="correction">Correction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_bon">Numéro de bon</Label>
                    <Input
                      id="numero_bon"
                      name="numero_bon"
                      value={formData.numero_bon}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observations</Label>
                  <Input
                    id="observations"
                    name="observations"
                    value={formData.observations}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon" title="Rafraîchir">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Input
            placeholder="Rechercher une sortie..."
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
                  <TableHead>Date</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Entrepôt</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Bon</TableHead>
                  <TableHead>Observations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSorties && filteredSorties.length > 0 ? (
                  filteredSorties.map((sortie) => (
                    <TableRow key={sortie.id}>
                      <TableCell>
                        {format(new Date(sortie.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sortie.article?.nom || 'N/A'}
                      </TableCell>
                      <TableCell>{sortie.entrepot?.nom || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sortie.type_sortie === 'vente' 
                            ? 'bg-green-100 text-green-800' 
                            : sortie.type_sortie === 'transfert'
                            ? 'bg-blue-100 text-blue-800'
                            : sortie.type_sortie === 'perte'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {sortie.type_sortie === 'vente' 
                            ? 'Vente' 
                            : sortie.type_sortie === 'transfert'
                            ? 'Transfert'
                            : sortie.type_sortie === 'perte'
                            ? 'Perte'
                            : 'Correction'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{sortie.quantite}</TableCell>
                      <TableCell>{sortie.destination || 'N/A'}</TableCell>
                      <TableCell>{sortie.numero_bon || 'N/A'}</TableCell>
                      <TableCell>{sortie.observations || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Aucune sortie trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Sorties;
