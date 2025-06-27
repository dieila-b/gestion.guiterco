
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useBonsCommande } from '@/hooks/useBonsCommande';
import { useAllBonCommandeArticles } from '@/hooks/useBonCommandeArticles';
import { useBonCommandeApproval } from '@/hooks/useBonCommandeApproval';
import { useBonCommandeDelete } from '@/hooks/useBonCommandeDelete';
import { BonCommandeTable } from './BonCommandeTable';
import { BonCommandeHeader } from './BonCommandeHeader';
import { BonCommandeSearch } from './BonCommandeSearch';

const BonsCommande = () => {
  const { bonsCommande, isLoading, error, refetch } = useBonsCommande();
  const { data: articlesCounts, isLoading: loadingArticles } = useAllBonCommandeArticles();
  const { handleApprove } = useBonCommandeApproval();
  const { handleDelete } = useBonCommandeDelete();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBons = bonsCommande?.filter(bon =>
    bon.numero_bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.fournisseur.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Composant d'erreur
  if (error) {
    return (
      <div className="space-y-6">
        <BonCommandeHeader />
        
        <Card className="bg-white border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4 text-red-600">
              <AlertTriangle className="h-8 w-8" />
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Erreur de chargement des données
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Impossible de charger les bons de commande. Vérifiez votre connexion.
                </p>
                <Button 
                  onClick={() => refetch()} 
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Composant de chargement
  if (isLoading) {
    return (
      <div className="space-y-6">
        <BonCommandeHeader />
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Liste des bons de commande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-12">
              <div className="flex items-center space-x-4 text-white">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Chargement des bons de commande...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BonCommandeHeader />

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Liste des bons de commande</CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                {filteredBons.length} bon{filteredBons.length > 1 ? 's' : ''} de commande trouvé{filteredBons.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <BonCommandeSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BonCommandeTable
            bons={filteredBons}
            articlesCounts={articlesCounts || {}}
            onApprove={handleApprove}
            onDelete={handleDelete}
          />
          
          {filteredBons.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? (
                <div>
                  <p>Aucun résultat trouvé pour "{searchTerm}"</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-gray-400 hover:text-white"
                  >
                    Effacer la recherche
                  </Button>
                </div>
              ) : (
                <div>
                  <p>Aucun bon de commande trouvé</p>
                  <p className="text-sm mt-1">Créez votre premier bon de commande pour commencer</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BonsCommande;
