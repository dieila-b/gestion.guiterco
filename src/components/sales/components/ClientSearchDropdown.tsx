
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  nom: string;
  nom_entreprise?: string;
  statut_client: string;
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
        .select('id, nom, statut_client')
        .or(`nom.ilike.%${term}%`)
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

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchClients(searchTerm);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleClientSelect = (client: Client) => {
    const clientName = client.nom;
    setSelectedClient(clientName);
    setSearchTerm(clientName);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedClient(value);
    setShowDropdown(true);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            className="flex-1"
          />
          
          {showDropdown && (searchTerm.length >= 2) && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">Recherche...</div>
              ) : clients.length > 0 ? (
                clients.map((client) => {
                  const displayName = client.nom;
                  
                  return (
                    <div
                      key={client.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-medium text-gray-900">{displayName}</div>
                      <div className="text-sm text-gray-500 capitalize">{client.statut_client}</div>
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
    </div>
  );
};

export default ClientSearchDropdown;
