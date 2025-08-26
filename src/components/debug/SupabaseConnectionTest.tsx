
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestResult {
  table: string;
  status: 'success' | 'error' | 'testing';
  count?: number;
  error?: string;
}

export const SupabaseConnectionTest = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);

  const tables = [
    'catalogue',
    'stock_principal', 
    'stock_pdv',
    'entrepots',
    'points_de_vente',
    'clients',
    'categories_catalogue',
    'unites'
  ];

  const testTable = async (tableName: string): Promise<TestResult> => {
    try {
      console.log(`🧪 Test table: ${tableName}`);
      const { data, error, count } = await supabase
        .from(tableName)
        .select('id', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.error(`❌ Erreur ${tableName}:`, error);
        return {
          table: tableName,
          status: 'error',
          error: error.message
        };
      }
      
      return {
        table: tableName,
        status: 'success',
        count: count || 0
      };
    } catch (error) {
      return {
        table: tableName,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  };

  const testAllTables = async () => {
    setIsTestingAll(true);
    setResults([]);
    
    // Initialiser avec le statut "testing"
    const initialResults = tables.map(table => ({
      table,
      status: 'testing' as const
    }));
    setResults(initialResults);

    // Tester chaque table
    for (const table of tables) {
      const result = await testTable(table);
      setResults(prev => prev.map(r => 
        r.table === table ? result : r
      ));
    }
    
    setIsTestingAll(false);
  };

  const testSupabaseAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('🔐 Auth status:', { user: !!user, error });
      return { user: !!user, error: error?.message };
    } catch (error) {
      console.error('🔐 Auth error:', error);
      return { user: false, error: error instanceof Error ? error.message : 'Erreur auth' };
    }
  };

  useEffect(() => {
    // Test automatique au montage
    testAllTables();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Test de Connexion Supabase
          <Button 
            onClick={testAllTables} 
            disabled={isTestingAll}
            variant="outline"
          >
            {isTestingAll ? 'Test en cours...' : 'Relancer les tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {results.map((result) => (
            <div 
              key={result.table}
              className={`p-3 rounded border flex justify-between items-center ${
                result.status === 'success' ? 'bg-green-50 border-green-200' :
                result.status === 'error' ? 'bg-red-50 border-red-200' :
                'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div>
                <span className="font-mono font-semibold">{result.table}</span>
                {result.count !== undefined && (
                  <span className="ml-2 text-sm text-gray-600">
                    ({result.count} enregistrements)
                  </span>
                )}
              </div>
              <div className="flex items-center">
                {result.status === 'success' && (
                  <span className="text-green-600 font-semibold">✅ OK</span>
                )}
                {result.status === 'error' && (
                  <div className="text-right">
                    <span className="text-red-600 font-semibold">❌ Erreur</span>
                    {result.error && (
                      <div className="text-xs text-red-500 mt-1">
                        {result.error}
                      </div>
                    )}
                  </div>
                )}
                {result.status === 'testing' && (
                  <span className="text-yellow-600 font-semibold">⏳ Test...</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Informations de debug :</h3>
          <ul className="text-sm space-y-1">
            <li>• URL Supabase: {supabase.supabaseUrl}</li>
            <li>• Clé Anon: {supabase.supabaseKey.substring(0, 20)}...</li>
            <li>• Environnement: {import.meta.env.MODE}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
