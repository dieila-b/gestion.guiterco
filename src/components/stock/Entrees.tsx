
import React, { useState } from 'react';
import { useEntreesStock, useCatalogue, useEntrepots, usePointsDeVente } from '@/hooks/stock';
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
import { formatCurrency } from '@/lib/currency';

const Entrees = () => {
  const { entrees, isLoading, createEntree } = useEntreesStock();
  const { articles } = useCatalogue();
  const { entrepots } = useEntrepots();
  const { pointsDeVente } = usePointsDeVente();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    article_id: '',
    entrepot_id: '',
    quantite: 0,
    type_entree: 'achat',
    numero_bon: '',
    fournisseur: '',
    prix_unitaire: 0,
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
      await createEntree.mutateAsync({
        ...formData,
        quantite: Number(formData.quantite),
        prix_unitaire: formData.prix_unitaire ? Number(formData.prix_unitaire) : null
      });
      setIsDialogOpen(false);
      setFormData({
        article_id: '',
        entrepot_id: '',
        quantite: 0,
        type_entree: 'achat',
        numero_bon: '',
        fournisseur: '',
        prix_unitaire: 0,
        observations: '',
        created_by: 'Utilisateur'
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout d'entrée:", error);
    }
  };

  const filteredEntrees = entrees?.filter(entree => 
    entree.article?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entree.article?.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entree.entrepot?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entree.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combiner entrepôts et points de vente pour le sélecteur
  const emplacements = [
    ...(entrepots?.map(e => ({ id: e.id, nom: e.nom, type: 'Entrepôt' })) || []),
    ...(pointsDeVente?.map(p => ({ id: p.id, nom: p.nom, type: 'Point de vente' })) || [])
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Entrées de Stock</CardTitle>
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle entrée
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Ajouter une entrée de stock</DialogTitle>
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
                    <Label htmlFor="entrepot_id">Emplacement *</Label>
                    <Select 
                      value={formData.entrepot_id} 
                      onValueChange={(value) => handleSelectChange('entrepot_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {emplacements.map(emplacement => (
                          <SelectItem key={emplacement.id} value={emplacement.id}>
                            {emplacement.nom} ({emplacement.type})
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
                    <Label htmlFor="type_entree">Type d'entrée *</Label>
                    <Select 
                      value={formData.type_entree} 
                      onValueChange={(value) => handleSelectChange('type_entree', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achat">Achat</SelectItem>
                        <SelectItem value="retour">Retour</SelectItem>
                        <SelectItem value="transfert">Transfert</SelectItem>
                        <SelectItem value="correction">Correction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_bon">Numéro de bon</Label>
                    <Input
                      id="numero_bon"
                      name="numero_bon"
                      value={formData.numero_bon}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fournisseur">Fournisseur</Label>
                    <Input
                      id="fournisseur"
                      name="fournisseur"
                      value={formData.fournisseur}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prix_unitaire">Prix unitaire (GNF)</Label>
                  <Input
                    id="prix_unitaire"
                    name="prix_unitaire"
                    type="number"
                    step="1"
                    value={formData.prix_unitaire}
                    onChange={handleInputChange}
                    placeholder="Prix en GNF"
                  />
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
            placeholder="Rechercher une entrée..."
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
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead>Bon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntrees && filteredEntrees.length > 0 ? (
                  filteredEntrees.map((entree) => (
                    <TableRow key={entree.id}>
                      <TableCell>
                        {format(new Date(entree.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entree.article?.nom || 'N/A'}
                      </TableCell>
                      <TableCell>{entree.entrepot?.nom || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entree.type_entree === 'achat' 
                            ? 'bg-blue-100 text-blue-800' 
                            : entree.type_entree === 'retour'
                            ? 'bg-green-100 text-green-800'
                            : entree.type_entree === 'transfert'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {entree.type_entree === 'achat' 
                            ? 'Achat' 
                            : entree.type_entree === 'retour'
                            ? 'Retour'
                            : entree.type_entree === 'transfert'
                            ? 'Transfert'
                            : 'Correction'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{entree.quantite}</TableCell>
                      <TableCell>{entree.fournisseur || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        {entree.prix_unitaire ? formatCurrency(entree.prix_unitaire) : 'N/A'}
                      </TableCell>
                      <TableCell>{entree.numero_bon || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Aucune entrée trouvée
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

export default Entrees;
