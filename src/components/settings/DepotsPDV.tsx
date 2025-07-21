
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Store } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const DepotsPDV = () => {
  const [pdvs, setPdvs] = useState([
    { id: 1, nom: 'Magasin Centre-Ville', adresse: '123 Rue Principale', manager: 'Sophie Durand', horaires: '9h-19h' },
    { id: 2, nom: 'Magasin Zone Commerciale', adresse: '456 Avenue du Commerce', manager: 'Pierre Leblanc', horaires: '10h-20h' }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPdv, setEditingPdv] = useState(null);
  const [formData, setFormData] = useState({ nom: '', adresse: '', manager: '', horaires: '' });
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPdv) {
      setPdvs(pdvs.map(pdv => 
        pdv.id === editingPdv.id ? { ...pdv, ...formData } : pdv
      ));
      toast({ title: "Point de vente mis à jour avec succès" });
    } else {
      setPdvs([...pdvs, { id: Date.now(), ...formData }]);
      toast({ title: "Point de vente ajouté avec succès" });
    }
    setIsDialogOpen(false);
    setFormData({ nom: '', adresse: '', manager: '', horaires: '' });
    setEditingPdv(null);
  };

  const handleEdit = (pdv) => {
    setEditingPdv(pdv);
    setFormData({ 
      nom: pdv.nom, 
      adresse: pdv.adresse, 
      manager: pdv.manager, 
      horaires: pdv.horaires 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setPdvs(pdvs.filter(pdv => pdv.id !== id));
    toast({ title: "Point de vente supprimé avec succès" });
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingPdv(null); setFormData({ nom: '', adresse: '', manager: '', horaires: '' }); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un PDV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPdv ? 'Modifier le point de vente' : 'Ajouter un point de vente'}
                  </DialogTitle>
                  <DialogDescription>
                    Saisissez les informations du point de vente
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nom">Nom du point de vente</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="manager">Manager</Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaires">Horaires</Label>
                    <Input
                      id="horaires"
                      value={formData.horaires}
                      onChange={(e) => setFormData({ ...formData, horaires: e.target.value })}
                      placeholder="ex: 9h-19h"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingPdv ? 'Modifier' : 'Ajouter'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Horaires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pdvs.map((pdv) => (
                <TableRow key={pdv.id}>
                  <TableCell className="font-medium">{pdv.nom}</TableCell>
                  <TableCell>{pdv.adresse}</TableCell>
                  <TableCell>{pdv.manager}</TableCell>
                  <TableCell>{pdv.horaires}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(pdv)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(pdv.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepotsPDV;
