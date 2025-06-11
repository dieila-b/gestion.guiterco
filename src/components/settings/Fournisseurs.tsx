
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ShoppingCart, Globe, Phone, Mail } from 'lucide-react';
import { useFournisseurs } from "@/hooks/useFournisseurs";
import FournisseurForm from './FournisseurForm';
import { Fournisseur } from '@/types/fournisseurs';

const Fournisseurs = () => {
  const { fournisseurs, createFournisseur, updateFournisseur } = useFournisseurs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState<Fournisseur | null>(null);

  const handleSubmit = (data: Partial<Fournisseur>) => {
    if (editingFournisseur) {
      updateFournisseur.mutate({ id: editingFournisseur.id, ...data });
    } else {
      createFournisseur.mutate(data);
    }
    setIsDialogOpen(false);
    setEditingFournisseur(null);
  };

  const handleEdit = (fournisseur: Fournisseur) => {
    setEditingFournisseur(fournisseur);
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingFournisseur(null);
  };

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'approuve': 'default',
      'en_attente': 'secondary',
      'refuse': 'destructive',
      'suspendu': 'outline',
      'inactif': 'outline'
    };
    return variants[statut] || 'outline';
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'approuve': 'Approuvé',
      'en_attente': 'En attente',
      'refuse': 'Refusé',
      'suspendu': 'Suspendu',
      'inactif': 'Inactif'
    };
    return labels[statut] || statut;
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
                  Gérez vos fournisseurs et leurs informations complètes
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingFournisseur(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un fournisseur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingFournisseur ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
                  </DialogTitle>
                  <DialogDescription>
                    Saisissez les informations complètes du fournisseur
                  </DialogDescription>
                </DialogHeader>
                <FournisseurForm
                  fournisseur={editingFournisseur || undefined}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entreprise</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Coordonnées</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fournisseurs?.map((fournisseur) => (
                <TableRow key={fournisseur.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {fournisseur.nom_entreprise || fournisseur.nom || 'N/A'}
                      </div>
                      {fournisseur.site_web && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Globe className="h-3 w-3 mr-1" />
                          <a 
                            href={fournisseur.site_web} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Site web
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {fournisseur.contact_principal && (
                        <div className="font-medium">{fournisseur.contact_principal}</div>
                      )}
                      {fournisseur.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {fournisseur.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {fournisseur.telephone_mobile && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded mr-1">Mob</span>
                          {fournisseur.telephone_mobile}
                        </div>
                      )}
                      {fournisseur.telephone_fixe && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          <span className="text-xs bg-green-100 text-green-800 px-1 rounded mr-1">Fix</span>
                          {fournisseur.telephone_fixe}
                        </div>
                      )}
                      {/* Fallback pour ancien champ telephone */}
                      {!fournisseur.telephone_mobile && !fournisseur.telephone_fixe && fournisseur.telephone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {fournisseur.telephone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {fournisseur.pays?.nom && (
                        <div>{fournisseur.pays.nom}</div>
                      )}
                      {(fournisseur.ville?.nom || fournisseur.ville_personnalisee) && (
                        <div className="text-muted-foreground">
                          {fournisseur.ville?.nom || fournisseur.ville_personnalisee}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatutBadge(fournisseur.statut || 'en_attente')}>
                      {getStatutLabel(fournisseur.statut || 'en_attente')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(fournisseur)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!fournisseurs || fournisseurs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun fournisseur trouvé. Cliquez sur "Ajouter un fournisseur" pour commencer.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fournisseurs;
