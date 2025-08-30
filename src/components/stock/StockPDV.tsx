
import React, { useState } from 'react';
import { useStockPDVView, useStockPDVStats } from '@/hooks/stock/useStockPDVView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Store, Package, DollarSign, RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date-utils';
import StockStatsCard from './StockStatsCard';

const StockPDV: React.FC = () => {
  const { data: stockPDV, isLoading, error, refetch } = useStockPDVView();
  const { data: stats, isLoading: statsLoading } = useStockPDVStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPDV, setSelectedPDV] = useState<string>('');

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement du stock PDV...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Erreur lors du chargement du stock PDV: {error.message}
      </div>
    );
  }

  // Filtrer les données
  const filteredStock = stockPDV?.filter(item => {
    const matchesSearch = !searchTerm || 
      item.article_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPDV = !selectedPDV || item.pdv_nom === selectedPDV;
    
    return matchesSearch && matchesPDV;
  }) || [];

  // Obtenir les PDV uniques
  const pointsDeVente = [...new Set(stockPDV?.map(item => item.pdv_nom) || [])];

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stock Points de Vente</h2>
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
          title="PDV actifs"
          value={stats?.pdv_actifs || 0}
          subtitle="Points de vente avec stock"
          icon={Store}
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
          value={selectedPDV}
          onChange={(e) => setSelectedPDV(e.target.value)}
          className="px-3 py-2 border rounded-md bg-white"
        >
          <option value="">Tous les points de vente</option>
          {pointsDeVente.map((pdv) => (
            <option key={pdv} value={pdv}>
              {pdv}
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
                <Store className="h-4 w-4 text-green-600" />
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
                  <span className="text-gray-600">Minimum:</span>
                  <div className={`font-semibold ${
                    item.quantite_minimum && item.quantite_disponible <= item.quantite_minimum
                      ? 'text-red-600' 
                      : 'text-gray-600'
                  }`}>
                    {item.quantite_minimum || 'N/A'} {item.unite_symbole || ''}
                  </div>
                </div>
              </div>

              {/* Alerte stock faible */}
              {item.quantite_minimum && item.quantite_disponible <= item.quantite_minimum && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-600">Stock faible</span>
                </div>
              )}

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

              {/* PDV et catégorie */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    <Store className="h-3 w-3 mr-1" />
                    {item.pdv_nom}
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
                {item.type_pdv && (
                  <Badge variant="secondary" className="text-xs">
                    {item.type_pdv}
                  </Badge>
                )}
              </div>

              {/* Dernière livraison */}
              {item.derniere_livraison && (
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Dernière livraison: {formatDate(item.derniere_livraison)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredStock.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || selectedPDV 
            ? "Aucun article trouvé avec ces filtres" 
            : "Aucun stock disponible en PDV"
          }
        </div>
      )}
    </div>
  );
};

export default StockPDV;
