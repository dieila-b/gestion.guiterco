
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface ClientsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ClientsSearch: React.FC<ClientsSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher un client (nom, entreprise, email, téléphone...)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default ClientsSearch;
