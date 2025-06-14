
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  nom: string;
  nom_entreprise?: string;
  type_client: string;
  email?: string;
  telephone?: string;
  statut_client?: string;
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

  // Fonction de recherche améliorée dans Supabase
  const searchClients = async (term: string) => {
    if (term.length < 2) {
      setClients([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Recherche de clients avec le terme:', term);
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, nom_entreprise, type_client, email, telephone, statut_client')
        .or(`nom.ilike.%${term}%,nom_entreprise.ilike.%${term}%,email.ilike.%${term}%,telephone.ilike.%${term}%`)
        .limit(20);

      if (error) {
        console.error('Erreur lors de la recherche de clients:', error);
        throw error;
      }
      
      console.log('Clients trouvés:', data);
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
          console.log('Chargement du client avec ID:', selectedClient);
          
          const { data, error } = await supabase
            .from('clients')
            .select('id, nom, nom_entreprise, type_client, email, telephone, statut_client')
            .eq('id', selectedClient)
            .single();

          if (!error && data) {
            console.log('Client chargé:', data);
            setSelectedClientData(data);
            const displayName = data.statut_client === 'entreprise' && data.nom_entreprise 
              ? `${data.nom_entreprise} (${data.nom})`
              : data.nom;
            setSearchTerm(displayName);
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
      if (searchTerm.length >= 2) {
        searchClients(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleClientSelect = (client: Client) => {
    console.log('Client sélectionné:', client);
    setSelectedClient(client.id); // Stocker l'ID, pas le nom
    setSelectedClientData(client);
    const displayName = client.statut_client === 'entreprise' && client.nom_entreprise 
      ? `${client.nom_entreprise} (${client.nom})`
      : client.nom;
    setSearchTerm(displayName);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    
    // Si l'utilisateur efface ou modifie le champ, réinitialiser la sélection
    if (!value || (selectedClientData && !value.includes(selectedClientData.nom))) {
      setSelectedClient('');
      setSelectedClientData(null);
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (searchTerm.length >= 2) {
      searchClients(searchTerm);
    }
  };

  const handleInputBlur = () => {
    // Délai pour permettre le clic sur les éléments de la liste
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const clearSelection = () => {
    setSelectedClient('');
    setSelectedClientData(null);
    setSearchTerm('');
    setClients([]);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un client (nom, entreprise, email, téléphone...)"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className={`pl-10 ${selectedClientData ? 'border-green-300 bg-green-50' : ''}`}
            />
            {selectedClientData && (
              <button
                onClick={clearSelection}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          {showDropdown && (searchTerm.length >= 2) && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Recherche...
                  </div>
                </div>
              ) : clients.length > 0 ? (
                clients.map((client) => {
                  const isSelected = selectedClientData?.id === client.id;
                  const displayName = client.statut_client === 'entreprise' && client.nom_entreprise 
                    ? `${client.nom_entreprise} (${client.nom})`
                    : client.nom;
                  
                  return (
                    <div
                      key={client.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                        isSelected ? 'bg-green-50 border-green-200' : ''
                      }`}
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-medium text-gray-900">{displayName}</div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="capitalize">
                          {client.statut_client || client.type_client || 'Client'}
                        </div>
                        {client.email && <div>📧 {client.email}</div>}
                        {client.telephone && <div>📞 {client.telephone}</div>}
                      </div>
                      {isSelected && <div className="text-xs text-green-600 mt-1">✅ Sélectionné</div>}
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-gray-500">
                  <div className="mb-2">Aucun client trouvé pour "{searchTerm}"</div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onNewClient();
                    }}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Créer un nouveau client
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button size="sm" variant="outline" title="Voir le profil du client">
          <User className="h-4 w-4" />
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={onNewClient}
          title="Créer un nouveau client"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouveau
        </Button>
      </div>
      
      {selectedClientData && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
          <div className="font-medium text-green-800">
            ✅ Client sélectionné : {selectedClientData.nom}
            {selectedClientData.nom_entreprise && ` (${selectedClientData.nom_entreprise})`}
          </div>
          <div className="text-green-600 mt-1">
            ID: {selectedClientData.id} • Type: {selectedClientData.statut_client || selectedClientData.type_client}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSearchDropdown;
