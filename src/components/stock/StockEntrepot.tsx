
import React, { useState } from 'react';
import { useStockEntrepotView, useStockEntrepotStats } from '@/hooks/stock/useStockEntrepotView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Warehouse, DollarSign, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date-utils';
import StockStatsCard from './StockStatsCard';

const StockEntrepot: React.FC = () => {
  const { data: stockEntrepot, isLoading, error, refetch } = useStockEntrepotView();
  const { data: stats, isLoading: statsLoading } = useStockEntrepotStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntrepot, setSelectedEntrepot] = useState<string>('');

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement du stock entrepôt...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Erreur lors du chargement du stock entrepôt: {error.message}
      </div>
    );
  }

  // Filtrer les données
  const filteredStock = stockEntrepot?.filter(item => {
    const matchesSearch = !searchTerm || 
      item.article_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntrepot = !selectedEntrepot || item.entrepot_nom === selectedEntrepot;
    
    return matchesSearch && matchesEntrepot;
  }) || [];

  // Obtenir les entrepôts uniques
  const entrepots = [...new Set(stockEntrepot?.map(item => item.entrepot_nom) || [])];

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stock Entrepôt</h2>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StockStatsCard
          title="Articles en stock"
          value={stats?.total_articles || 0}
          subtitle="Articles disponibles"
          icon={Package}
          iconColor="text-green-600"
        />
        <StockStatsCard
          title="Valeur totale"
          value={stats?.valeur_totale || 0}
          subtitle="Valeur du stock"
          icon={DollarSign}
          iconColor="text-blue-600"
        />
        <StockStatsCard
          title="Entrepôts actifs"
          value={stats?.entrepots_actifs || 0}
          subtitle="Entrepôts avec stock"
          icon={Warehouse}
          iconColor="text-purple-600"
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={selectedEntrepot}
          onChange={(e) => setSelectedEntrepot(e.target.value)}
          className="px-3 py-2 border rounded-md bg-white"
        >
          <option value="">Tous les entrepôts</option>
          {entrepots.map((entrepot) => (
            <option key={entrepot} value={entrepot}>
              {entrepot}
            </option>
          ))}
        </select>
      </div>

      {/* Liste des articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStock.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium line-clamp-1">
                  {item.article_nom}
                </CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xs text-gray-500">
                Réf: {item.reference}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Quantités */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Disponible:</span>
                  <div className="font-semibold text-green-600">
                    {item.quantite_disponible} {item.unite_symbole || ''}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Réservé:</span>
                  <div className="font-semibold text-orange-600">
                    {item.quantite_reservee} {item.unite_symbole || ''}
                  </div>
                </div>
              </div>

              {/* Prix et valeur */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Prix vente:</span>
                  <div className="font-medium">
                    {item.prix_vente ? formatCurrency(item.prix_vente) : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Valeur totale:</span>
                  <div className="font-semibold text-blue-600">
                    {formatCurrency(item.valeur_totale)}
                  </div>
                </div>
              </div>

              {/* Entrepôt et catégorie */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    <Warehouse className="h-3 w-3 mr-1" />
                    {item.entrepot_nom}
                  </Badge>
                  {item.categorie_nom && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: item.categorie_couleur || undefined,
                        color: item.categorie_couleur || undefined
                      }}
                    >
                      {item.categorie_nom}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Dernière entrée */}
              {item.derniere_entree && (
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Dernière entrée: {formatDate(item.derniere_entree)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredStock.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || selectedEntrepot 
            ? "Aucun article trouvé avec ces filtres" 
            : "Aucun stock disponible en entrepôt"
          }
        </div>
      )}
    </div>
  );
};

export default StockEntrepot;
