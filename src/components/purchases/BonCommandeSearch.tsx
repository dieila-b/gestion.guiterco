
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface BonCommandeSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const BonCommandeSearch = ({ searchTerm, onSearchChange }: BonCommandeSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Rechercher par numéro ou fournisseur..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-gray-700 border-gray-600 text-white"
      />
    </div>
  );
};
