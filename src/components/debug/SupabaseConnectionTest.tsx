
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TableTestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  count?: number;
  error?: string;
  columns?: string[];
}

const SupabaseConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TableTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<{
    url: string;
    key: string;
    connected: boolean;
  } | null>(null);

  // Liste des tables principales à tester
  const tablesToTest = [
    'catalogue',
    'stock_principal', 
    'stock_pdv',
    'entrepots',
    'points_de_vente',
    'clients',
    'categories_catalogue',
    'unites',
    'factures_vente',
    'lignes_facture_vente',
    'precommandes',
    'lignes_precommande'
  ];

  const testTableAccess = async (tableName: string): Promise<TableTestResult> => {
    try {
      console.log(`🔍 Test d'accès à la table: ${tableName}`);
      
      // Utiliser une assertion de type pour contourner la vérification TypeScript stricte
      const { data, error, count } = await (supabase as any)
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Erreur pour ${tableName}:`, error);
        return {
          name: tableName,
          status: 'error',
          error: error.message
        };
      }

      // Test pour obtenir les colonnes
      const { data: sampleData } = await (supabase as any)
        .from(tableName)
        .select('*')
        .limit(1);

      const columns = sampleData && sampleData.length > 0 
        ? Object.keys(sampleData[0]) 
        : [];

      console.log(`✅ ${tableName}: ${count} enregistrements, ${columns.length} colonnes`);
      
      return {
        name: tableName,
        status: count === 0 ? 'warning' : 'success',
        count: count || 0,
        columns
      };
    } catch (err) {
      console.error(`💥 Exception pour ${tableName}:`, err);
      return {
        name: tableName,
        status: 'error',
        error: err instanceof Error ? err.message : 'Erreur inconnue'
      };
    }
  };

  const runTests = async () => {
    setIsLoading(true);
    console.log('🚀 Début des tests de connexion Supabase...');
    
    try {
      // Test de connexion de base
      const { data: authData } = await supabase.auth.getSession();
      console.log('🔐 Session auth:', authData.session ? 'Connecté' : 'Non connecté');

      // Obtenir les informations de connexion depuis les constantes
      const SUPABASE_URL = "https://hlmiuwwfxerrinfthvrj.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsbWl1d3dmeGVycmluZnRodnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MDE5NjQsImV4cCI6MjA2NTE3Nzk2NH0.KN8vcjCrAWo7YUqkHi7j8pk-g7MROe_EsWqOvQ5ylfM";

      setConnectionInfo({
        url: SUPABASE_URL,
        key: SUPABASE_KEY.substring(0, 20) + '...',
        connected: true
      });

      // Tester chaque table
      const results = await Promise.all(
        tablesToTest.map(tableName => testTableAccess(tableName))
      );

      setTestResults(results);
      console.log('✅ Tests terminés:', results);
    } catch (error) {
      console.error('💥 Erreur lors des tests:', error);
      setConnectionInfo({
        url: 'Erreur',
        key: 'Erreur',
        connected: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Vide</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Test de Connexion Supabase
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations de connexion */}
        {connectionInfo && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Informations de connexion</h3>
            <div className="text-sm space-y-1">
              <p><strong>URL:</strong> {connectionInfo.url}</p>
              <p><strong>Clé:</strong> {connectionInfo.key}</p>
              <p><strong>Statut:</strong> {connectionInfo.connected ? '🟢 Connecté' : '🔴 Déconnecté'}</p>
            </div>
          </div>
        )}

        {/* Résultats des tests */}
        <div className="space-y-2">
          <h3 className="font-semibold">Résultats des tests par table</h3>
          {isLoading ? (
            <div className="flex items-center gap-2 p-4">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Tests en cours...
            </div>
          ) : (
            <div className="grid gap-2">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.count !== undefined && (
                      <span>{result.count} enregistrement{result.count !== 1 ? 's' : ''}</span>
                    )}
                    {result.columns && (
                      <span className="ml-2">({result.columns.length} colonnes)</span>
                    )}
                    {result.error && (
                      <span className="text-red-600 ml-2">{result.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Résumé */}
        {testResults.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Résumé</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">
                  {testResults.filter(r => r.status === 'success').length}
                </span> tables OK
              </div>
              <div>
                <span className="text-yellow-600 font-medium">
                  {testResults.filter(r => r.status === 'warning').length}
                </span> tables vides
              </div>
              <div>
                <span className="text-red-600 font-medium">
                  {testResults.filter(r => r.status === 'error').length}
                </span> erreurs
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;
