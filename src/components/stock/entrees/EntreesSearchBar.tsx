
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface EntreesSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const EntreesSearchBar = ({ searchTerm, onSearchChange }: EntreesSearchBarProps) => {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
      <Input
        placeholder="Rechercher une entrée..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full"
      />
      <Button type="submit" size="icon" variant="secondary">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
};
