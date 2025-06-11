
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, UserCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const UtilisateursInternes = () => {
  const [utilisateurs, setUtilisateurs] = useState([
    { id: 1, nom: 'Admin User', email: 'admin@gestcompta.com', role: 'admin', statut: 'actif' },
    { id: 2, nom: 'Manager Stock', email: 'manager@gestcompta.com', role: 'manager', statut: 'actif' },
    { id: 3, nom: 'Vendeur PDV', email: 'vendeur@gestcompta.com', role: 'vendeur', statut: 'inactif' }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUtilisateur, setEditingUtilisateur] = useState(null);
  const [formData, setFormData] = useState({ nom: '', email: '', role: '', statut: 'actif' });
  const { toast } = useToast();

  const roles = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'manager', label: 'Manager' },
    { value: 'vendeur', label: 'Vendeur' },
    { value: 'comptable', label: 'Comptable' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUtilisateur) {
      setUtilisateurs(utilisateurs.map(user => 
        user.id === editingUtilisateur.id ? { ...user, ...formData } : user
      ));
      toast({ title: "Utilisateur mis à jour avec succès" });
    } else {
      setUtilisateurs([...utilisateurs, { id: Date.now(), ...formData }]);
      toast({ title: "Utilisateur ajouté avec succès" });
    }
    setIsDialogOpen(false);
    setFormData({ nom: '', email: '', role: '', statut: 'actif' });
    setEditingUtilisateur(null);
  };

  const handleEdit = (utilisateur) => {
    setEditingUtilisateur(utilisateur);
    setFormData({ 
      nom: utilisateur.nom, 
      email: utilisateur.email, 
      role: utilisateur.role, 
      statut: utilisateur.statut 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setUtilisateurs(utilisateurs.filter(user => user.id !== id));
    toast({ title: "Utilisateur supprimé avec succès" });
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getStatutBadge = (statut) => {
    return statut === 'actif' ? 
      <Badge className="bg-green-100 text-green-800">Actif</Badge> : 
      <Badge variant="secondary">Inactif</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <div>
                <CardTitle>Utilisateurs Internes</CardTitle>
                <CardDescription>
                  Gérez les utilisateurs et leurs droits d'accès
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingUtilisateur(null); setFormData({ nom: '', email: '', role: '', statut: 'actif' }); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUtilisateur ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                  </DialogTitle>
                  <DialogDescription>
                    Saisissez les informations de l'utilisateur
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nom">Nom complet</Label>
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
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="statut">Statut</Label>
                    <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
                      <SelectTrigger>
                        <SelectValue />
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
                      {editingUtilisateur ? 'Modifier' : 'Ajouter'}
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
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utilisateurs.map((utilisateur) => (
                <TableRow key={utilisateur.id}>
                  <TableCell className="font-medium">{utilisateur.nom}</TableCell>
                  <TableCell>{utilisateur.email}</TableCell>
                  <TableCell>{getRoleLabel(utilisateur.role)}</TableCell>
                  <TableCell>{getStatutBadge(utilisateur.statut)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(utilisateur)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(utilisateur.id)}>
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

export default UtilisateursInternes;
