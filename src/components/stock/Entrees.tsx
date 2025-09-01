
import React, { useState, useEffect } from 'react';
import { useEntreesStock } from '@/hooks/stock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddEntreeDialog } from './entrees/AddEntreeDialog';
import { EntreesSearchBar } from './entrees/EntreesSearchBar';
import { EntreesTable } from './entrees/EntreesTable';

const Entrees = () => {
  const { entrees, isLoading, error, refreshEntrees } = useEntreesStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Forcer le rafraîchissement au montage du composant
  useEffect(() => {
    console.log('Entrees component mounted, refreshing data...');
    refreshEntrees();
  }, []);

  // Log des données pour debug
  useEffect(() => {
    console.log('Entrees data updated:', entrees);
    console.log('Number of entrees:', entrees?.length);
    console.log('Is loading:', isLoading);
    console.log('Error:', error);
  }, [entrees, isLoading, error]);

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
    console.log('Manual refresh triggered');
    refreshEntrees();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Entrées de Stock</CardTitle>
        <div className="flex space-x-2">
          <AddEntreeDialog 
            isOpen={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
          />
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
      <CardContent>
        {/* Affichage d'erreur détaillé */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>Erreur lors du chargement des entrées de stock:</div>
                <div className="text-sm font-mono bg-destructive/10 p-2 rounded">
                  {error.message}
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Réessayer
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Informations de debug en mode développement */}
        {process.env.NODE_ENV === 'development' && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm">
              <div className="space-y-1">
                <div>📊 Debug Info:</div>
                <div>• Données chargées: {entrees?.length || 0} entrées</div>
                <div>• Données filtrées: {filteredEntrees?.length || 0} entrées</div>
                <div>• État de chargement: {isLoading ? 'En cours...' : 'Terminé'}</div>
                <div>• Terme de recherche: "{searchTerm}"</div>
                {error && <div>• Erreur: {error.message}</div>}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <EntreesSearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <EntreesTable 
          entrees={filteredEntrees}
          isLoading={isLoading}
        />

        {/* Message personnalisé quand aucune donnée */}
        {!isLoading && !error && (!entrees || entrees.length === 0) && (
          <div className="text-center py-8 space-y-4">
            <div className="text-muted-foreground">
              Aucune entrée de stock trouvée dans la base de données.
            </div>
            <div className="space-x-2">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser les données
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                Créer une nouvelle entrée
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Entrees;
