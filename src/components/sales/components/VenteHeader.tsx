
import React from 'react';
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
  pointsDeVente?: any[];
}

const VenteHeader: React.FC<VenteHeaderProps> = ({
  selectedPDV,
  setSelectedPDV,
  searchProduct,
  setSearchProduct,
  selectedCategory,
  setSelectedCategory,
  uniqueCategories,
  pointsDeVente = []
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sélection du point de vente */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Point de vente</label>
          <Select value={selectedPDV} onValueChange={setSelectedPDV}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un PDV" />
            </SelectTrigger>
            <SelectContent>
              {pointsDeVente.map((pdv) => (
                <SelectItem key={pdv.id} value={pdv.nom}>
                  {pdv.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recherche de produit */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Recherche produit</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Scanner ou rechercher..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtre par catégorie */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Catégorie</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Toutes catégories</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Info du PDV sélectionné */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Statut</label>
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${selectedPDV ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">
              {selectedPDV ? `${selectedPDV} - Connecté` : 'Aucun PDV sélectionné'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenteHeader;
