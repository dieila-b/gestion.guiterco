
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ClientsSearch from './clients/ClientsSearch';
import ClientsTable from './clients/ClientsTable';
import ClientsStats from './clients/ClientsStats';
import NewClientDialog from './clients/NewClientDialog';

interface Client {
  id: string;
  nom: string;
  nom_entreprise?: string;
  statut_client?: string;
  type_client?: string;
  email?: string;
  telephone?: string;
  whatsapp?: string;
  adresse?: string;
  ville?: string;
  limite_credit?: number;
  created_at: string;
}

const ClientsSettings = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Charger les clients depuis Supabase
  const loadClients = async () => {
    setIsLoading(true);
    try {
      console.log('Chargement des clients depuis Supabase...');
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('nom', { ascending: true });

      if (error) {
        console.error('Erreur lors du chargement des clients:', error);
        throw error;
      }
      
      console.log('Clients chargés:', data);
      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des clients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleNewClientSuccess = (clientData: { id: string; nom: string }) => {
    console.log('Client créé avec succès:', clientData);
    toast({
      title: "Client créé avec succès",
      description: `${clientData.nom} a été ajouté à votre liste de clients.`,
    });
    setIsDialogOpen(false);
    loadClients(); // Recharger la liste
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
        loadClients();
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <div>
                <CardTitle>Clients</CardTitle>
                <CardDescription>
                  Gérez vos clients et leurs informations
                </CardDescription>
              </div>
            </div>
            <NewClientDialog 
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onClientCreated={handleNewClientSuccess}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ClientsSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chargement des clients...</p>
            </div>
          ) : (
            <>
              <ClientsTable 
                clients={clients}
                searchTerm={searchTerm}
                onDelete={handleDelete}
              />
              <ClientsStats clients={clients} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsSettings;
