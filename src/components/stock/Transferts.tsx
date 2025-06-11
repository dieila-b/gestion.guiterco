
import React, { useState } from 'react';
import { useTransferts, useCatalogue, useEntrepots, usePointsDeVente } from '@/hooks/useStock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, RefreshCw, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const Transferts = () => {
  const { transferts, isLoading, createTransfert, updateTransfert } = useTransferts();
  const { articles } = useCatalogue();
  const { entrepots } = useEntrepots();
  const { pointsDeVente } = usePointsDeVente();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    article_id: '',
    entrepot_source_id: '',
    destination_type: 'entrepot', // 'entrepot' ou 'pdv'
    entrepot_destination_id: '',
    pdv_destination_id: '',
    quantite: 0,
    numero_transfert: '',
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
    if (!formData.article_id || !formData.entrepot_source_id || formData.quantite <= 0 ||
        (formData.destination_type === 'entrepot' && !formData.entrepot_destination_id) ||
        (formData.destination_type === 'pdv' && !formData.pdv_destination_id)) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTransfert.mutateAsync({
        article_id: formData.article_id,
        entrepot_source_id: formData.entrepot_source_id,
        entrepot_destination_id: formData.destination_type === 'entrepot' ? formData.entrepot_destination_id : null,
        pdv_destination_id: formData.destination_type === 'pdv' ? formData.pdv_destination_id : null,
        quantite: Number(formData.quantite),
        statut: 'en_cours',
        numero_transfert: formData.numero_transfert || null,
        date_expedition: null,
        date_reception: null,
        observations: formData.observations || null,
        created_by: formData.created_by
      });
      setIsDialogOpen(false);
      setFormData({
        article_id: '',
        entrepot_source_id: '',
        destination_type: 'entrepot',
        entrepot_destination_id: '',
        pdv_destination_id: '',
        quantite: 0,
        numero_transfert: '',
        observations: '',
        created_by: 'Utilisateur'
      });
    } catch (error) {
      console.error("Erreur lors de la création du transfert:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updateData: any = {
        id,
        statut: newStatus
      };
      
      if (newStatus === 'expedie') {
        updateData.date_expedition = new Date().toISOString();
      } else if (newStatus === 'recu') {
        updateData.date_reception = new Date().toISOString();
      }
      
      await updateTransfert.mutateAsync(updateData);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  };

  const filteredTransferts = transferts?.filter(transfert => 
    transfert.article?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    transfert.entrepot_source?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfert.entrepot_destination?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfert.pdv_destination?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfert.statut?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Transferts</CardTitle>
        <div className="flex space-x-2">
          <Button variant="default" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau transfert
          </Button>
          <Button variant="outline" size="icon" title="Rafraîchir">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Input
            placeholder="Rechercher un transfert..."
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
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Expédition</TableHead>
                  <TableHead>Réception</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransferts && filteredTransferts.length > 0 ? (
                  filteredTransferts.map((transfert) => (
                    <TableRow key={transfert.id}>
                      <TableCell>
                        {format(new Date(transfert.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transfert.article?.nom || 'N/A'}
                      </TableCell>
                      <TableCell>{transfert.entrepot_source?.nom || 'N/A'}</TableCell>
                      <TableCell>
                        {transfert.entrepot_destination?.nom || transfert.pdv_destination?.nom || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">{transfert.quantite}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transfert.statut === 'en_cours' 
                            ? 'bg-blue-100 text-blue-800' 
                            : transfert.statut === 'expedie'
                            ? 'bg-orange-100 text-orange-800'
                            : transfert.statut === 'recu'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transfert.statut === 'en_cours' 
                            ? 'En cours' 
                            : transfert.statut === 'expedie'
                            ? 'Expédié'
                            : transfert.statut === 'recu'
                            ? 'Reçu'
                            : 'Annulé'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {transfert.date_expedition 
                          ? format(new Date(transfert.date_expedition), 'dd/MM/yyyy', { locale: fr })
                          : 'Non expédié'}
                      </TableCell>
                      <TableCell>
                        {transfert.date_reception 
                          ? format(new Date(transfert.date_reception), 'dd/MM/yyyy', { locale: fr })
                          : 'Non reçu'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {transfert.statut === 'en_cours' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(transfert.id, 'expedie')}
                              title="Marquer comme expédié"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {transfert.statut === 'expedie' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(transfert.id, 'recu')}
                              title="Marquer comme reçu"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {(transfert.statut === 'en_cours' || transfert.statut === 'expedie') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(transfert.id, 'annule')}
                              title="Annuler le transfert"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      Aucun transfert trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Modal d'ajout de transfert */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Créer un nouveau transfert</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
              <Label htmlFor="entrepot_source_id">Entrepôt source *</Label>
              <Select 
                value={formData.entrepot_source_id} 
                onValueChange={(value) => handleSelectChange('entrepot_source_id', value)}
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

            <div className="space-y-2">
              <Label htmlFor="destination_type">Type de destination *</Label>
              <Select 
                value={formData.destination_type} 
                onValueChange={(value) => handleSelectChange('destination_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrepot">Entrepôt</SelectItem>
                  <SelectItem value="pdv">Point de vente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.destination_type === 'entrepot' ? (
              <div className="space-y-2">
                <Label htmlFor="entrepot_destination_id">Entrepôt destination *</Label>
                <Select 
                  value={formData.entrepot_destination_id} 
                  onValueChange={(value) => handleSelectChange('entrepot_destination_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entrepots?.filter(e => e.id !== formData.entrepot_source_id).map(entrepot => (
                      <SelectItem key={entrepot.id} value={entrepot.id}>
                        {entrepot.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="pdv_destination_id">Point de vente destination *</Label>
                <Select 
                  value={formData.pdv_destination_id} 
                  onValueChange={(value) => handleSelectChange('pdv_destination_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pointsDeVente?.map(pdv => (
                      <SelectItem key={pdv.id} value={pdv.id}>
                        {pdv.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
              <Label htmlFor="numero_transfert">Numéro de transfert</Label>
              <Input
                id="numero_transfert"
                name="numero_transfert"
                value={formData.numero_transfert}
                onChange={handleInputChange}
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
              <Button type="submit">Créer le transfert</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Transferts;
