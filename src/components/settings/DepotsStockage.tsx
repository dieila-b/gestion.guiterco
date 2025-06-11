
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Warehouse } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const DepotsStockage = () => {
  const [depots, setDepots] = useState([
    { id: 1, nom: 'Entrepôt Principal', adresse: '123 Zone Industrielle', capacite: '1000 m²', responsable: 'Jean Dupont' },
    { id: 2, nom: 'Entrepôt Secondaire', adresse: '456 Rue des Stocks', capacite: '500 m²', responsable: 'Marie Martin' }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState(null);
  const [formData, setFormData] = useState({ nom: '', adresse: '', capacite: '', responsable: '' });
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDepot) {
      setDepots(depots.map(depot => 
        depot.id === editingDepot.id ? { ...depot, ...formData } : depot
      ));
      toast({ title: "Dépôt mis à jour avec succès" });
    } else {
      setDepots([...depots, { id: Date.now(), ...formData }]);
      toast({ title: "Dépôt ajouté avec succès" });
    }
    setIsDialogOpen(false);
    setFormData({ nom: '', adresse: '', capacite: '', responsable: '' });
    setEditingDepot(null);
  };

  const handleEdit = (depot) => {
    setEditingDepot(depot);
    setFormData({ 
      nom: depot.nom, 
      adresse: depot.adresse, 
      capacite: depot.capacite, 
      responsable: depot.responsable 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setDepots(depots.filter(depot => depot.id !== id));
    toast({ title: "Dépôt supprimé avec succès" });
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingDepot(null); setFormData({ nom: '', adresse: '', capacite: '', responsable: '' }); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un dépôt
                </Button>
              </DialogTrigger>
              <DialogContent>
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
                    <Label htmlFor="nom">Nom du dépôt</Label>
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
                    <Label htmlFor="capacite">Capacité</Label>
                    <Input
                      id="capacite"
                      value={formData.capacite}
                      onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
                      placeholder="ex: 1000 m²"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsable">Responsable</Label>
                    <Input
                      id="responsable"
                      value={formData.responsable}
                      onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    />
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Capacité</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depots.map((depot) => (
                <TableRow key={depot.id}>
                  <TableCell className="font-medium">{depot.nom}</TableCell>
                  <TableCell>{depot.adresse}</TableCell>
                  <TableCell>{depot.capacite}</TableCell>
                  <TableCell>{depot.responsable}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(depot)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(depot.id)}>
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

export default DepotsStockage;
