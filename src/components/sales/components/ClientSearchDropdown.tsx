
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  nom: string;
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
  const [selectedClientData, setSelectedClientData] = useState<Client | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Rechercher les clients dans Supabase
  const searchClients = async (term: string) => {
    if (term.length < 2) {
      setClients([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, type_client')
        .ilike('nom', `%${term}%`)
        .limit(10);

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
    const loadSelectedClient = async () => {
      if (selectedClient && selectedClient.length === 36) { // UUID length check
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('id, nom, type_client')
            .eq('id', selectedClient)
            .single();

          if (!error && data) {
            setSelectedClientData(data);
            setSearchTerm(data.nom);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du client:', error);
        }
      }
    };

    loadSelectedClient();
  }, [selectedClient]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchClients(searchTerm);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client.id); // Stocker l'ID, pas le nom
    setSelectedClientData(client);
    setSearchTerm(client.nom);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    
    // Si l'utilisateur efface ou modifie le champ, réinitialiser la sélection
    if (!value || (selectedClientData && value !== selectedClientData.nom)) {
      setSelectedClient('');
      setSelectedClientData(null);
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // Délai pour permettre le clic sur les éléments de la liste
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={`flex-1 ${selectedClientData ? 'border-green-300 bg-green-50' : ''}`}
          />
          
          {showDropdown && (searchTerm.length >= 2) && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">Recherche...</div>
              ) : clients.length > 0 ? (
                clients.map((client) => {
                  const isSelected = selectedClientData?.id === client.id;
                  return (
                    <div
                      key={client.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                        isSelected ? 'bg-green-50 border-green-200' : ''
                      }`}
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-medium text-gray-900">{client.nom}</div>
                      <div className="text-sm text-gray-500 capitalize">{client.type_client}</div>
                      {isSelected && <div className="text-xs text-green-600 mt-1">Sélectionné</div>}
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-gray-500">Aucun client trouvé</div>
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
      
      {selectedClientData && (
        <div className="mt-2 text-xs text-green-600">
          Client sélectionné : {selectedClientData.nom} ({selectedClientData.type_client})
        </div>
      )}
    </div>
  );
};

export default ClientSearchDropdown;
