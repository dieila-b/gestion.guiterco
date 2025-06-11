
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Fournisseurs = () => {
  const [fournisseurs, setFournisseurs] = useState([
    { id: 1, nom: 'Fournisseur A', email: 'contact@fournisseura.com', telephone: '01 23 45 67 89', adresse: '123 Rue du Commerce' },
    { id: 2, nom: 'Fournisseur B', email: 'info@fournisseurb.com', telephone: '01 98 76 54 32', adresse: '456 Avenue des Affaires' }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState(null);
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', adresse: '' });
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFournisseur) {
      setFournisseurs(fournisseurs.map(f => 
        f.id === editingFournisseur.id ? { ...f, ...formData } : f
      ));
      toast({ title: "Fournisseur mis à jour avec succès" });
    } else {
      setFournisseurs([...fournisseurs, { id: Date.now(), ...formData }]);
      toast({ title: "Fournisseur ajouté avec succès" });
    }
    setIsDialogOpen(false);
    setFormData({ nom: '', email: '', telephone: '', adresse: '' });
    setEditingFournisseur(null);
  };

  const handleEdit = (fournisseur) => {
    setEditingFournisseur(fournisseur);
    setFormData({ 
      nom: fournisseur.nom, 
      email: fournisseur.email, 
      telephone: fournisseur.telephone, 
      adresse: fournisseur.adresse 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setFournisseurs(fournisseurs.filter(f => f.id !== id));
    toast({ title: "Fournisseur supprimé avec succès" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <div>
                <CardTitle>Fournisseurs</CardTitle>
                <CardDescription>
                  Gérez vos fournisseurs et leurs catalogues
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingFournisseur(null); setFormData({ nom: '', email: '', telephone: '', adresse: '' }); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un fournisseur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingFournisseur ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
                  </DialogTitle>
                  <DialogDescription>
                    Saisissez les informations du fournisseur
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nom">Nom du fournisseur</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingFournisseur ? 'Modifier' : 'Ajouter'}
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
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fournisseurs.map((fournisseur) => (
                <TableRow key={fournisseur.id}>
                  <TableCell className="font-medium">{fournisseur.nom}</TableCell>
                  <TableCell>{fournisseur.email}</TableCell>
                  <TableCell>{fournisseur.telephone}</TableCell>
                  <TableCell>{fournisseur.adresse}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(fournisseur)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(fournisseur.id)}>
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

export default Fournisseurs;
