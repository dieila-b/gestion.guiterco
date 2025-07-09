
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Plus, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  nom: string;
  prenom?: string;
  nom_entreprise?: string;
  type_client: string;
}

interface ClientSearchDropdownProps {
  selectedClient: string;
  setSelectedClient: (value: string) => void;
  onNewClient: () => void;
}

const ClientSearchDropdown: React.FC<ClientSearchDropdownProps> = ({
  selectedClient,
  setSelectedClient,
  onNewClient
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClientData, setSelectedClientData] = useState<Client | null>(null);

  // Charger tous les clients au montage du composant
  const loadAllClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, prenom, nom_entreprise, type_client')
        .order('nom', { ascending: true })
        .limit(50);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Rechercher les clients dans Supabase
  const searchClients = async (term: string) => {
    if (term.length < 2) {
      loadAllClients();
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, prenom, nom_entreprise, type_client')
        .or(`nom.ilike.%${term}%,prenom.ilike.%${term}%,nom_entreprise.ilike.%${term}%`)
        .order('nom', { ascending: true })
        .limit(20);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors de la recherche de clients:', error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données du client sélectionné si on a un ID
  useEffect(() => {
    const loadSelectedClientData = async () => {
      if (selectedClient && selectedClient.length > 10) { // Vérifier si c'est un UUID
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('id, nom, prenom, nom_entreprise, type_client')
            .eq('id', selectedClient)
            .single();

          if (error) throw error;
          if (data) {
            setSelectedClientData(data);
            setSearchTerm(getClientDisplayName(data));
          }
        } catch (error) {
          console.error('Erreur lors du chargement du client sélectionné:', error);
          setSelectedClientData(null);
        }
      }
    };

    loadSelectedClientData();
  }, [selectedClient]);

  useEffect(() => {
    loadAllClients();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (showDropdown) {
        searchClients(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, showDropdown]);

  const handleClientSelect = (client: Client) => {
    console.log('🎯 Client sélectionné dans dropdown:', client);
    const clientName = getClientDisplayName(client);
    setSelectedClient(client.id); // S'assurer que l'ID est bien passé
    setSelectedClientData(client);
    setSearchTerm(clientName);
    setShowDropdown(false);
    console.log('✅ Client ID envoyé:', client.id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Si l'utilisateur modifie le texte, réinitialiser la sélection
    if (value !== getClientDisplayName(selectedClientData)) {
      setSelectedClient('');
      setSelectedClientData(null);
    }
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (!searchTerm) {
      loadAllClients();
    }
  };

  const getClientDisplayName = (client: Client | null) => {
    if (!client) return '';
    if (client.nom_entreprise) {
      return client.nom_entreprise;
    }
    return client.prenom ? `${client.prenom} ${client.nom}` : client.nom;
  };

  const getClientSecondaryInfo = (client: Client) => {
    if (client.nom_entreprise && client.nom) {
      return client.prenom ? `${client.prenom} ${client.nom}` : client.nom;
    }
    return client.type_client;
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="flex-1 pr-8"
            />
            <ChevronDown 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            />
          </div>
          
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">Recherche...</div>
              ) : clients.length > 0 ? (
                clients.map((client) => {
                  const displayName = getClientDisplayName(client);
                  const secondaryInfo = getClientSecondaryInfo(client);
                  
                  return (
                    <div
                      key={client.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-medium text-gray-900">{displayName}</div>
                      <div className="text-sm text-gray-500">{secondaryInfo}</div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-gray-500">
                  {searchTerm ? 'Aucun client trouvé' : 'Aucun client disponible'}
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button size="sm" variant="outline">
          <User className="h-4 w-4" />
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={onNewClient}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouveau
        </Button>
      </div>
    </div>
  );
};

export default ClientSearchDropdown;
