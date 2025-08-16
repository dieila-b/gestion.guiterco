
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Users, Package } from 'lucide-react';
import { useDataFix, useCatalogueForced, useClientsForced, useUtilisateursInternesForced } from '@/hooks/useDataFix';

const QuickDataFix = () => {
  const { forceRefresh } = useDataFix();
  const { data: catalogueData, isLoading: catalogueLoading, refetch: refetchCatalogue } = useCatalogueForced();
  const { data: clientsData, isLoading: clientsLoading, refetch: refetchClients } = useClientsForced();
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useUtilisateursInternesForced();

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchCatalogue(),
      refetchClients(),
      refetchUsers(),
      forceRefresh()
    ]);
  };

  return (
    <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="h-5 w-5" />
          Correction rapide des données
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="font-medium">Produits</span>
            </div>
            <Badge variant={catalogueData && catalogueData.length > 0 ? "default" : "destructive"}>
              {catalogueLoading ? '...' : catalogueData?.length || 0}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Clients</span>
            </div>
            <Badge variant={clientsData && clientsData.length > 0 ? "default" : "destructive"}>
              {clientsLoading ? '...' : clientsData?.length || 0}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Utilisateurs</span>
            </div>
            <Badge variant={usersData && usersData.length > 0 ? "default" : "destructive"}>
              {usersLoading ? '...' : usersData?.length || 0}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleRefreshAll}
            disabled={catalogueLoading || clientsLoading || usersLoading}
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser toutes les données
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Rechargement complet
          </Button>
        </div>

        {/* Affichage des données de debug */}
        <div className="mt-4 space-y-2">
          {catalogueData && catalogueData.length > 0 && (
            <div className="text-sm text-green-600">
              ✅ {catalogueData.length} produits détectés dans Supabase
            </div>
          )}
          {clientsData && clientsData.length > 0 && (
            <div className="text-sm text-green-600">
              ✅ {clientsData.length} clients détectés dans Supabase
            </div>
          )}
          {usersData && usersData.length > 0 && (
            <div className="text-sm text-green-600">
              ✅ {usersData.length} utilisateurs internes détectés dans Supabase
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickDataFix;
