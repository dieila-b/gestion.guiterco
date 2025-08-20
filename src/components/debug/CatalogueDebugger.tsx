import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, RefreshCw, Database, Eye, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataSeeder from './DataSeeder';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

const CatalogueDebugger = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // Test 1: Connexion Supabase de base
      console.log('🔍 Test 1: Connexion de base');
      try {
        const { data: testConnection } = await supabase.from('catalogue').select('count').limit(1);
        diagnosticResults.push({
          test: 'Connexion Supabase',
          status: 'success',
          message: 'Connexion établie avec succès'
        });
      } catch (error) {
        diagnosticResults.push({
          test: 'Connexion Supabase',
          status: 'error',
          message: `Erreur de connexion: ${(error as Error).message}`
        });
      }

      // Test 2: Vérification des données brutes
      console.log('🔍 Test 2: Données catalogue brutes');
      try {
        const { data: rawData, error: rawError, count } = await supabase
          .from('catalogue')
          .select('*', { count: 'exact' });
        
        if (rawError) {
          diagnosticResults.push({
            test: 'Données brutes catalogue',
            status: 'error',
            message: `Erreur: ${rawError.message}`,
            data: rawError
          });
        } else {
          diagnosticResults.push({
            test: 'Données brutes catalogue',
            status: rawData && rawData.length > 0 ? 'success' : 'warning',
            message: `${count || 0} produit(s) trouvé(s) dans la base`,
            data: { count, sample: rawData?.slice(0, 3) }
          });
        }
      } catch (error) {
        diagnosticResults.push({
          test: 'Données brutes catalogue',
          status: 'error',
          message: `Exception: ${(error as Error).message}`
        });
      }

      // Test 3: Test avec la requête optimisée
      console.log('🔍 Test 3: Requête optimisée');
      try {
        const { data: optimizedData, error: optimizedError } = await supabase
          .from('catalogue')
          .select(`
            id,
            nom,
            reference,
            description,
            prix_achat,
            prix_vente,
            prix_unitaire,
            categorie,
            unite_mesure,
            categorie_id,
            unite_id,
            seuil_alerte,
            image_url,
            statut,
            created_at,
            updated_at,
            categorie_article:categories_catalogue(nom)
          `)
          .order('nom', { ascending: true });

        if (optimizedError) {
          diagnosticResults.push({
            test: 'Requête optimisée',
            status: 'error',
            message: `Erreur: ${optimizedError.message}`,
            data: optimizedError
          });
        } else {
          diagnosticResults.push({
            test: 'Requête optimisée',
            status: optimizedData && optimizedData.length > 0 ? 'success' : 'warning',
            message: `${optimizedData?.length || 0} produit(s) avec relations`,
            data: optimizedData?.slice(0, 2)
          });
        }
      } catch (error) {
        diagnosticResults.push({
          test: 'Requête optimisée',
          status: 'error',
          message: `Exception: ${(error as Error).message}`
        });
      }

      // Test 4: Vérification RLS
      console.log('🔍 Test 4: Policies RLS');
      try {
        const { data: userData } = await supabase.auth.getUser();
        diagnosticResults.push({
          test: 'Authentification utilisateur',
          status: userData.user ? 'success' : 'warning',
          message: userData.user ? `Utilisateur connecté: ${userData.user.email}` : 'Aucun utilisateur connecté'
        });

        // Test des permissions explicites
        const { data: permissionTest, error: permissionError } = await supabase
          .rpc('check_user_permission_strict', {
            p_menu: 'Catalogue',
            p_action: 'read'
          });

        if (permissionError) {
          diagnosticResults.push({
            test: 'Permissions RLS',
            status: 'error',
            message: `Erreur permissions: ${permissionError.message}`
          });
        } else {
          diagnosticResults.push({
            test: 'Permissions RLS',
            status: permissionTest ? 'success' : 'error',
            message: permissionTest ? 'Permissions OK' : 'Permissions refusées'
          });
        }
      } catch (error) {
        diagnosticResults.push({
          test: 'Permissions RLS',
          status: 'error',
          message: `Exception: ${(error as Error).message}`
        });
      }

      // Test 5: Vérification des catégories
      console.log('🔍 Test 5: Table categories_catalogue');
      try {
        const { data: categories, error: catError } = await supabase
          .from('categories_catalogue')
          .select('*');

        if (catError) {
          diagnosticResults.push({
            test: 'Table categories_catalogue',
            status: 'error',
            message: `Erreur: ${catError.message}`
          });
        } else {
          diagnosticResults.push({
            test: 'Table categories_catalogue',
            status: 'success',
            message: `${categories?.length || 0} catégorie(s) trouvée(s)`,
            data: categories?.slice(0, 3)
          });
        }
      } catch (error) {
        diagnosticResults.push({
          test: 'Table categories_catalogue',
          status: 'error',
          message: `Exception: ${(error as Error).message}`
        });
      }

      // Test 6: Test sans RLS (mode admin/dev)
      console.log('🔍 Test 6: Test contournement RLS');
      try {
        // Essayer une requête très simple sans relations
        const { data: simpleData, error: simpleError } = await supabase
          .from('catalogue')
          .select('id, nom, reference')
          .limit(5);

        if (simpleError) {
          diagnosticResults.push({
            test: 'Requête simple sans RLS',
            status: 'error',
            message: `Erreur: ${simpleError.message}`
          });
        } else {
          diagnosticResults.push({
            test: 'Requête simple sans RLS',
            status: simpleData && simpleData.length > 0 ? 'success' : 'warning',
            message: `${simpleData?.length || 0} produit(s) en mode simple`,
            data: simpleData
          });
        }
      } catch (error) {
        diagnosticResults.push({
          test: 'Requête simple sans RLS',
          status: 'error',
          message: `Exception: ${(error as Error).message}`
        });
      }

      setResults(diagnosticResults);
      
      // Afficher un résumé
      const successCount = diagnosticResults.filter(r => r.status === 'success').length;
      const errorCount = diagnosticResults.filter(r => r.status === 'error').length;
      
      toast({
        title: "Diagnostic terminé",
        description: `${successCount} succès, ${errorCount} erreur(s)`,
        variant: errorCount > 0 ? "destructive" : "default"
      });
      
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
      toast({
        title: "Erreur de diagnostic",
        description: "Impossible d'exécuter tous les tests",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
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

  return (
    <Tabs defaultValue="diagnostics" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        <TabsTrigger value="seeder">Créer Données Test</TabsTrigger>
      </TabsList>
      
      <TabsContent value="diagnostics">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Diagnostic Catalogue Complet
              </CardTitle>
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Diagnostic en cours...' : 'Lancer diagnostic'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.length === 0 && !isRunning && (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Cliquez sur "Lancer diagnostic" pour analyser le catalogue</p>
              </div>
            )}
            
            {isRunning && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p>Diagnostic en cours...</p>
              </div>
            )}

            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Voir les données
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="seeder">
        <DataSeeder />
      </TabsContent>
    </Tabs>
  );
};

export default CatalogueDebugger;
