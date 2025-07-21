
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ZoneGeographique = () => {
  const [zones, setZones] = useState([
    { id: 1, nom: 'Région Nord', type: 'région', description: 'Zone géographique du nord' },
    { id: 2, nom: 'Ville Centre', type: 'ville', description: 'Centre ville principal' }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({ nom: '', type: '', description: '' });
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingZone) {
      setZones(zones.map(zone => 
        zone.id === editingZone.id ? { ...zone, ...formData } : zone
      ));
      toast({ title: "Zone mise à jour avec succès" });
    } else {
      setZones([...zones, { id: Date.now(), ...formData }]);
      toast({ title: "Zone ajoutée avec succès" });
    }
    setIsDialogOpen(false);
    setFormData({ nom: '', type: '', description: '' });
    setEditingZone(null);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({ nom: zone.nom, type: zone.type, description: zone.description });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setZones(zones.filter(zone => zone.id !== id));
    toast({ title: "Zone supprimée avec succès" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <div>
                <CardTitle>Zones Géographiques</CardTitle>
                <CardDescription>
                  Gérez les emplacements, régions et zones géographiques
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingZone(null); setFormData({ nom: '', type: '', description: '' }); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une zone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingZone ? 'Modifier la zone' : 'Ajouter une zone géographique'}
                  </DialogTitle>
                  <DialogDescription>
                    Saisissez les informations de la zone géographique
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nom">Nom de la zone</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      placeholder="région, ville, département..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingZone ? 'Modifier' : 'Ajouter'}
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
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.nom}</TableCell>
                  <TableCell>{zone.type}</TableCell>
                  <TableCell>{zone.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(zone)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(zone.id)}>
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

export default ZoneGeographique;
