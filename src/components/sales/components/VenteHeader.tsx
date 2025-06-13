
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface VenteHeaderProps {
  selectedPDV: string;
  setSelectedPDV: (value: string) => void;
  searchProduct: string;
  setSearchProduct: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  uniqueCategories: string[];
}

const VenteHeader: React.FC<VenteHeaderProps> = ({
  selectedPDV,
  setSelectedPDV,
  searchProduct,
  setSearchProduct,
  selectedCategory,
  setSelectedCategory,
  uniqueCategories
}) => {
  return (
    <div className="bg-white border-b p-4 flex-shrink-0 shadow-sm">
      <h1 className="text-xl font-bold mb-3">Vente au Comptoir</h1>
      
      {/* Contrôles */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <Select value={selectedPDV} onValueChange={setSelectedPDV}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PDV Madina">PDV Madina</SelectItem>
            <SelectItem value="PDV Centre">PDV Centre</SelectItem>
            <SelectItem value="PDV Nord">PDV Nord</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'Tous' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('Tous')}
          size="sm"
        >
          Tous
        </Button>
        {uniqueCategories.slice(0, 5).map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default VenteHeader;
