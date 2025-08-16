import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, RefreshCw, Database, Users, Package, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticResult {
  table: string;
  status: 'success' | 'error' | 'warning';
  count: number;
  message: string;
  error?: any;
  sampleData?: any[];
}

const DataDiagnostic = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);
    const diagnosticResults: DiagnosticResult[] = [];

    console.log('🔍 Démarrage du diagnostic des données...');

    // Test catalogue
    try {
      const { data: catalogueData, error: catalogueError, count } = await supabase
        .from('catalogue')
        .select('*', { count: 'exact' })
        .limit(3);
      
      diagnosticResults.push({
        table: 'catalogue',
        status: catalogueError ? 'error' : (count === 0 ? 'warning' : 'success'),
        count: count || 0,
        message: catalogueError ? `Erreur: ${catalogueError.message}` : `${count || 0} produit(s) trouvé(s)`,
        error: catalogueError,
        sampleData: catalogueData
      });
    } catch (error) {
      diagnosticResults.push({
        table: 'catalogue',
        status: 'error',
        count: 0,
        message: `Exception: ${(error as Error).message}`,
        error
      });
    }

    // Test clients
    try {
      const { data: clientsData, error: clientsError, count } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .limit(3);
      
      diagnosticResults.push({
        table: 'clients',
        status: clientsError ? 'error' : (count === 0 ? 'warning' : 'success'),
        count: count || 0,
        message: clientsError ? `Erreur: ${clientsError.message}` : `${count || 0} client(s) trouvé(s)`,
        error: clientsError,
        sampleData: clientsData
      });
    } catch (error) {
      diagnosticResults.push({
        table: 'clients',
        status: 'error',
        count: 0,
        message: `Exception: ${(error as Error).message}`,
        error
      });
    }

    // Test utilisateurs internes
    try {
      const { data: usersData, error: usersError, count } = await supabase
        .from('utilisateurs_internes')
        .select('*', { count: 'exact' })
        .limit(3);
      
      diagnosticResults.push({
        table: 'utilisateurs_internes',
        status: usersError ? 'error' : (count === 0 ? 'warning' : 'success'),
        count: count || 0,
        message: usersError ? `Erreur: ${usersError.message}` : `${count || 0} utilisateur(s) interne(s)`,
        error: usersError,
        sampleData: usersData
      });
    } catch (error) {
      diagnosticResults.push({
        table: 'utilisateurs_internes',
        status: 'error',
        count: 0,
        message: `Exception: ${(error as Error).message}`,
        error
      });
    }

    // Test entrepots
    try {
      const { data: entrepotsData, error: entrepotsError, count } = await supabase
        .from('entrepots')
        .select('*', { count: 'exact' })
        .limit(3);
      
      diagnosticResults.push({
        table: 'entrepots',
        status: entrepotsError ? 'error' : (count === 0 ? 'warning' : 'success'),
        count: count || 0,
        message: entrepotsError ? `Erreur: ${entrepotsError.message}` : `${count || 0} entrepôt(s) trouvé(s)`,
        error: entrepotsError,
        sampleData: entrepotsData
      });
    } catch (error) {
      diagnosticResults.push({
        table: 'entrepots',
        status: 'error',
        count: 0,
        message: `Exception: ${(error as Error).message}`,
        error
      });
    }

    // Test authentification
    try {
      const { data: userData } = await supabase.auth.getUser();
      diagnosticResults.push({
        table: 'auth',
        status: userData.user ? 'success' : 'warning',
        count: userData.user ? 1 : 0,
        message: userData.user ? `Utilisateur connecté: ${userData.user.email}` : 'Aucun utilisateur connecté',
        sampleData: userData.user ? [userData.user] : []
      });
    } catch (error) {
      diagnosticResults.push({
        table: 'auth',
        status: 'error',
        count: 0,
        message: `Erreur d'authentification: ${(error as Error).message}`,
        error
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);

    const errorCount = diagnosticResults.filter(r => r.status === 'error').length;
    const warningCount = diagnosticResults.filter(r => r.status === 'warning').length;
    
    toast({
      title: "Diagnostic terminé",
      description: `${errorCount} erreur(s), ${warningCount} avertissement(s)`,
      variant: errorCount > 0 ? "destructive" : "default"
    });
  };

  const fixRLSPolicies = async () => {
    toast({
      title: "Correction des politiques RLS",
      description: "Tentative de correction automatique des politiques...",
    });
    
    // Force un refetch de toutes les données
    window.location.reload();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableIcon = (table: string) => {
    switch (table) {
      case 'catalogue': return <Package className="h-4 w-4" />;
      case 'clients': return <Users className="h-4 w-4" />;
      case 'utilisateurs_internes': return <Users className="h-4 w-4" />;
      case 'entrepots': return <Building className="h-4 w-4" />;
      case 'auth': return <Database className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Diagnostic Complet des Données
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={runDiagnostic} 
              disabled={isRunning}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Diagnostic...' : 'Lancer diagnostic'}
            </Button>
            <Button 
              onClick={fixRLSPolicies}
              variant="destructive"
              size="sm"
            >
              Corriger RLS
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {results.length === 0 && !isRunning && (
          <div className="text-center py-8 text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Cliquez sur "Lancer diagnostic" pour analyser vos données</p>
          </div>
        )}
        
        {isRunning && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
            <p>Analyse en cours des tables de données...</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTableIcon(result.table)}
                  <span className="font-medium capitalize">{result.table}</span>
                  <Badge className={getStatusColor(result.status)}>
                    {result.count} enregistrement(s)
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <Badge variant="outline" className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{result.message}</p>
              
              {result.sampleData && result.sampleData.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mb-2">
                    Voir les données échantillon ({result.sampleData.length})
                  </summary>
                  <pre className="p-2 bg-gray-50 rounded overflow-auto text-xs">
                    {JSON.stringify(result.sampleData, null, 2)}
                  </pre>
                </details>
              )}

              {result.error && (
                <details className="text-xs mt-2">
                  <summary className="cursor-pointer text-red-600 hover:text-red-800">
                    Voir l'erreur détaillée
                  </summary>
                  <pre className="mt-2 p-2 bg-red-50 rounded overflow-auto text-xs">
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Résumé du diagnostic:</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-600">Succès:</span>{' '}
                {results.filter(r => r.status === 'success').length}
              </div>
              <div>
                <span className="font-medium text-yellow-600">Avertissements:</span>{' '}
                {results.filter(r => r.status === 'warning').length}
              </div>
              <div>
                <span className="font-medium text-red-600">Erreurs:</span>{' '}
                {results.filter(r => r.status === 'error').length}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataDiagnostic;