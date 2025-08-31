
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package } from 'lucide-react';
import DataSyncStatus from '@/components/sync/DataSyncStatus';

interface VenteHeaderProps {
  selectedPDV: string;
  setSelectedPDV: (pdv: string) => void;
  searchProduct: string;
  setSearchProduct: (search: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  uniqueCategories: string[];
  pointsDeVente: any[];
}

const VenteHeader: React.FC<VenteHeaderProps> = ({
  selectedPDV,
  setSelectedPDV,
  searchProduct,
  setSearchProduct,
  selectedCategory,
  setSelectedCategory,
  uniqueCategories,
  pointsDeVente
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-col space-y-4">
        {/* Statut de synchronisation */}
        <DataSyncStatus />
        
        {/* Titre */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Vente au comptoir</h1>
          </div>
        </div>

        {/* Contrôles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sélection PDV */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Point de vente
            </label>
            <Select value={selectedPDV} onValueChange={setSelectedPDV}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un PDV" />
              </SelectTrigger>
              <SelectContent>
                {pointsDeVente.map((pdv) => (
                  <SelectItem key={pdv.id} value={pdv.id}>
                    {pdv.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recherche produit */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Recherche produit
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nom ou référence..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtre catégorie */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Catégorie
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Toutes catégories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchProduct('');
                setSelectedCategory('Tous');
              }}
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenteHeader;
