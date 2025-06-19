
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface SearchAndActionsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const SearchAndActions: React.FC<SearchAndActionsProps> = ({
  searchValue,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h2 className="text-xl font-semibold">Factures Impayées</h2>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>
    </div>
  );
};

export default SearchAndActions;
