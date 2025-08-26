
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Warehouse, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SupabaseConnectionTest } from '@/components/debug/SupabaseConnectionTest';
import { useUltraFastCatalogue, useUltraFastStock, useUltraFastConfig, useUltraFastClients } from '@/hooks/useUltraCache';

const Dashboard = () => {
  const [showDebug, setShowDebug] = useState(false);
  
  // Utiliser les hooks ultra-rapides pour tester le chargement
  const { data: articles, isLoading: catalogueLoading } = useUltraFastCatalogue();
  const { data: stockData, isLoading: stockLoading } = useUltraFastStock();
  const { data: configData, isLoading: configLoading } = useUltraFastConfig();
  const { data: clients, isLoading: clientsLoading } = useUltraFastClients();

  const stockEntrepot = stockData?.stockEntrepot || [];
  const stockPDV = stockData?.stockPDV || [];
  const entrepots = configData?.entrepots || [];
  const pointsDeVente = configData?.pointsDeVente || [];

  // Statistiques calculées
  const stats = {
    totalArticles: articles?.length || 0,
    totalStock: stockEntrepot.reduce((sum, s) => sum + (s.quantite_disponible || 0), 0) + 
                stockPDV.reduce((sum, s) => sum + (s.quantite_disponible || 0), 0),
    totalClients: clients?.length || 0,
    totalEntrepots: entrepots.length,
    totalPDV: pointsDeVente.length
  };

  const isLoading = catalogueLoading || stockLoading || configLoading || clientsLoading;

  return (
    <AppLayout title="Tableau de bord">
      <div className="space-y-6">
        {/* Bouton de debug */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <Button 
            onClick={() => setShowDebug(!showDebug)}
            variant="outline"
            size="sm"
          >
            {showDebug ? 'Masquer Debug' : 'Debug Supabase'}
          </Button>
        </div>

        {/* Debug panel */}
        {showDebug && (
          <div className="mb-6">
            <SupabaseConnectionTest />
          </div>
        )}

        {/* État de chargement */}
        {isLoading && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-yellow-800">Chargement des données...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArticles}</div>
              <p className="text-xs text-muted-foreground">
                {catalogueLoading ? 'Chargement...' : 'Total catalogue'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStock}</div>
              <p className="text-xs text-muted-foreground">
                {stockLoading ? 'Chargement...' : 'Unités en stock'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                {clientsLoading ? 'Chargement...' : 'Clients actifs'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntrepots + stats.totalPDV}</div>
              <p className="text-xs text-muted-foreground">
                {configLoading ? 'Chargement...' : `${stats.totalEntrepots} entrepôts, ${stats.totalPDV} PDV`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Informations de diagnostic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>État du système</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Données chargées :</h3>
                <ul className="space-y-1 text-sm">
                  <li className={`flex items-center space-x-2 ${articles?.length ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{articles?.length ? '✅' : '❌'}</span>
                    <span>Catalogue: {articles?.length || 0} articles</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${stockEntrepot.length ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{stockEntrepot.length ? '✅' : '❌'}</span>
                    <span>Stock entrepôt: {stockEntrepot.length} lignes</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${stockPDV.length ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{stockPDV.length ? '✅' : '❌'}</span>
                    <span>Stock PDV: {stockPDV.length} lignes</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${clients?.length ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{clients?.length ? '✅' : '❌'}</span>
                    <span>Clients: {clients?.length || 0}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Configuration :</h3>
                <ul className="space-y-1 text-sm">
                  <li className={`flex items-center space-x-2 ${entrepots.length ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{entrepots.length ? '✅' : '❌'}</span>
                    <span>Entrepôts: {entrepots.length}</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${pointsDeVente.length ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{pointsDeVente.length ? '✅' : '❌'}</span>
                    <span>Points de vente: {pointsDeVente.length}</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message d'aide si pas de données */}
        {!isLoading && stats.totalArticles === 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Aucune donnée trouvée</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-4">
                Il semble qu'aucune donnée ne soit chargée depuis Supabase. Cela peut être dû à :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-orange-600">
                <li>Tables vides dans Supabase</li>
                <li>Problème de permissions RLS</li>
                <li>Erreur de connexion réseau</li>
                <li>Configuration Supabase incorrecte</li>
              </ul>
              <p className="mt-4 text-orange-700">
                Utilisez le bouton "Debug Supabase" ci-dessus pour diagnostiquer le problème.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
