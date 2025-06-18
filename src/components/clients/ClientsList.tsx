
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { useClientsQuery } from '@/hooks/useSalesQueries';
import { supabase } from '@/integrations/supabase/client';
import NewClientForm from '@/components/sales/components/NewClientForm';
import { formatCurrency } from '@/lib/currency';

const ClientsList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { data: clients = [], isLoading, refetch } = useClientsQuery();

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.nom.toLowerCase().includes(searchLower) ||
      (client.nom_entreprise && client.nom_entreprise.toLowerCase().includes(searchLower)) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.telephone && client.telephone.includes(searchTerm))
    );
  });

  const handleNewClientSuccess = (clientName: string) => {
    toast({
      title: "Client créé avec succès",
      description: `${clientName} a été ajouté à votre liste de clients.`,
    });
    setIsDialogOpen(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Client supprimé avec succès",
        });
        refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le client",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chargement des clients...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <div>
              <CardTitle>Liste des Clients</CardTitle>
              <CardDescription>
                Gérez vos clients et leurs informations
              </CardDescription>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-none w-screen h-screen p-0 bg-white m-0 rounded-none">
              <DialogHeader className="p-6 border-b border-gray-200">
                <DialogTitle className="text-2xl font-bold text-gray-800">Nouveau Client</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center p-6 overflow-y-auto">
                <NewClientForm 
                  onSuccess={handleNewClientSuccess}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un client (nom, entreprise, email, téléphone...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom / Entreprise</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Limite crédit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Aucun client trouvé pour cette recherche' : 'Aucun client enregistré'}
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => {
                const displayName = client.statut_client === 'entreprise' && client.nom_entreprise 
                  ? `${client.nom_entreprise} (${client.nom})`
                  : client.nom;
                
                return (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{displayName}</div>
                        {client.statut_client && (
                          <div className="text-xs text-gray-500 capitalize">
                            {client.statut_client}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {client.type_client || 'Non défini'}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.telephone && <div>{client.telephone}</div>}
                        {client.whatsapp && <div className="text-xs text-green-600">WhatsApp: {client.whatsapp}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{client.ville || '-'}</TableCell>
                    <TableCell>
                      {client.limite_credit ? formatCurrency(client.limite_credit) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" disabled>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {clients.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total clients:</span> {clients.length}
              </div>
              <div>
                <span className="font-medium">Particuliers:</span> {clients.filter(c => c.statut_client === 'particulier').length}
              </div>
              <div>
                <span className="font-medium">Entreprises:</span> {clients.filter(c => c.statut_client === 'entreprise').length}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsList;
