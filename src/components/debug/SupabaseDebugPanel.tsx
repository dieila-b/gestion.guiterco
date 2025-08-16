
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Database, RefreshCw, Shield } from 'lucide-react';
import { useDebugSupabase } from '@/hooks/useDebugSupabase';
import { useCatalogue } from '@/hooks/useCatalogue';

const SupabaseDebugPanel = () => {
  const { testConnection, checkRLSPolicies, syncAllData } = useDebugSupabase();
  const { articles, isLoading, error, refetch } = useCatalogue();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Diagnostic Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testConnection}
              variant="outline"
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              Test Connexion
            </Button>
            
            <Button 
              onClick={checkRLSPolicies}
              variant="outline"
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Vérifier RLS
            </Button>
            
            <Button 
              onClick={syncAllData}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Données
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            État du Catalogue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span>Statut:</span>
              <Badge variant={isLoading ? "secondary" : error ? "destructive" : "default"}>
                {isLoading ? "Chargement..." : error ? "Erreur" : "OK"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Nombre d'articles:</span>
              <Badge variant="outline">
                {articles?.length || 0}
              </Badge>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-medium">Erreur détectée:</p>
                <p className="text-sm text-red-600 mt-1">{error.message}</p>
              </div>
            )}
            
            <Button 
              onClick={() => refetch()}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recharger Catalogue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseDebugPanel;
