
import React, { useState } from 'react';
import { useEntreesStock } from '@/hooks/stock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { AddEntreeDialog } from './entrees/AddEntreeDialog';
import { EntreesSearchBar } from './entrees/EntreesSearchBar';
import { EntreesTable } from './entrees/EntreesTable';

const Entrees = () => {
  const { entrees, isLoading, error, refreshEntrees } = useEntreesStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredEntrees = entrees?.filter(entree => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      entree.article?.nom?.toLowerCase().includes(searchLower) || 
      entree.article?.reference?.toLowerCase().includes(searchLower) ||
      entree.entrepot?.nom?.toLowerCase().includes(searchLower) ||
      entree.point_vente?.nom?.toLowerCase().includes(searchLower) ||
      entree.fournisseur?.toLowerCase().includes(searchLower) ||
      entree.numero_bon?.toLowerCase().includes(searchLower) ||
      entree.type_entree?.toLowerCase().includes(searchLower)
    );
  });

  const handleRefresh = () => {
    refreshEntrees();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-xl font-bold">Entrées de Stock</CardTitle>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle entrée
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            title="Rafraîchir"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <EntreesSearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <EntreesTable 
          entrees={filteredEntrees}
          isLoading={isLoading}
        />

        {/* Messages d'état */}
        {!isLoading && !error && (!entrees || entrees.length === 0) && (
          <div className="text-center py-12 space-y-4">
            <div className="text-xl font-semibold text-muted-foreground">
              Aucune entrée de stock trouvée
            </div>
            <div className="text-sm text-muted-foreground">
              Commencez par créer votre première entrée de stock
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              Créer une nouvelle entrée
            </Button>
          </div>
        )}

        {/* Message de recherche vide */}
        {!isLoading && !error && entrees && entrees.length > 0 && filteredEntrees && filteredEntrees.length === 0 && searchTerm && (
          <div className="text-center py-8 space-y-4">
            <div className="text-lg font-semibold text-muted-foreground">
              Aucun résultat pour "{searchTerm}"
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              Effacer le filtre
            </Button>
          </div>
        )}

        <AddEntreeDialog 
          isOpen={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
        />
      </CardContent>
    </Card>
  );
};

export default Entrees;
