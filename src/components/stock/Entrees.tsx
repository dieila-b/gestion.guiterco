
import React, { useState, useEffect } from 'react';
import { useEntreesStock } from '@/hooks/stock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Database, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddEntreeDialog } from './entrees/AddEntreeDialog';
import { EntreesSearchBar } from './entrees/EntreesSearchBar';
import { EntreesTable } from './entrees/EntreesTable';

const Entrees = () => {
  const { entrees, isLoading, error, refreshEntrees } = useEntreesStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Log détaillé des données pour debug
  useEffect(() => {
    console.log('🔍 [Entrees Component] État complet des données:');
    console.log('  - Données brutes:', entrees);
    console.log('  - Nombre d\'entrées:', entrees?.length ?? 'undefined');
    console.log('  - En chargement:', isLoading);
    console.log('  - Erreur:', error);
    console.log('  - Type des données:', typeof entrees);
    console.log('  - Est un tableau:', Array.isArray(entrees));

    if (entrees && entrees.length > 0) {
      console.log('  - Premier élément:', entrees[0]);
      console.log('  - Structure de l\'article:', entrees[0]?.article);
      console.log('  - Structure de l\'entrepôt:', entrees[0]?.entrepot);
    }
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
    console.log('🔄 [Entrees] Rafraîchissement manuel déclenché');
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
        {/* Indicateur de statut en temps réel */}
        <Alert className={`mb-4 ${error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          {error ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription>
            <div className="space-y-1 text-sm">
              <div className="font-semibold">
                {error ? '❌ Erreur de connexion' : '✅ Connexion réussie'}
              </div>
              <div>• Données chargées: {entrees?.length || 0} entrées</div>
              <div>• Données filtrées: {filteredEntrees?.length || 0} entrées</div>
              <div>• État: {isLoading ? '🔄 Chargement...' : '✅ Prêt'}</div>
              <div>• Dernière sync: {new Date().toLocaleTimeString()}</div>
              {error && (
                <div className="mt-2 p-2 bg-red-100 rounded text-red-800 font-mono text-xs">
                  {error.message}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Affichage d'erreur détaillé */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div><strong>Erreur de synchronisation:</strong></div>
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
                  Réessayer la synchronisation
                </Button>
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

        {/* Message quand aucune donnée */}
        {!isLoading && !error && (!entrees || entrees.length === 0) && (
          <div className="text-center py-12 space-y-4">
            <Database className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <div className="text-xl font-semibold text-muted-foreground">
              Aucune entrée de stock trouvée
            </div>
            <div className="text-sm text-muted-foreground max-w-md mx-auto">
              La table entrees_stock semble vide ou les données ne sont pas accessibles. 
              Vérifiez la base de données Supabase ou créez votre première entrée.
            </div>
            <div className="space-x-2">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                Créer une nouvelle entrée
              </Button>
            </div>
          </div>
        )}

        {/* Message de données filtrées vides */}
        {!isLoading && !error && entrees && entrees.length > 0 && filteredEntrees && filteredEntrees.length === 0 && searchTerm && (
          <div className="text-center py-8 space-y-4">
            <div className="text-lg font-semibold text-muted-foreground">
              Aucun résultat pour "{searchTerm}"
            </div>
            <div className="text-sm text-muted-foreground">
              Essayez de modifier votre recherche ou effacez le filtre
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              Effacer le filtre
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Entrees;
