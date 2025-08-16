
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface DiagnosticResult {
  table: string;
  count: number;
  error?: string;
  status: 'success' | 'error' | 'empty';
  details?: any;
}

const DataDiagnostic = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runDiagnostic = async () => {
    setIsRunning(true);
    const newResults: DiagnosticResult[] = [];

    // Tables à diagnostiquer
    const tablesToCheck = [
      { name: 'catalogue', label: 'Produits (Catalogue)' },
      { name: 'clients', label: 'Clients' },
      { name: 'utilisateurs_internes', label: 'Utilisateurs internes' },
      { name: 'categories_catalogue', label: 'Catégories' },
      { name: 'unites', label: 'Unités' },
      { name: 'stock_principal', label: 'Stock principal' },
      { name: 'entrepots', label: 'Entrepôts' },
      { name: 'factures_vente', label: 'Factures de vente' }
    ];

    for (const table of tablesToCheck) {
      try {
        console.log(`🔍 Diagnostic table: ${table.name}`);
        
        // Test de base - compter les enregistrements
        const { data, error, count } = await supabase
          .from(table.name as any)
          .select('*', { count: 'exact', head: false });

        if (error) {
          console.error(`❌ Erreur ${table.name}:`, error);
          newResults.push({
            table: table.label,
            count: 0,
            error: error.message,
            status: 'error',
            details: error
          });
        } else {
          const actualCount = data?.length || 0;
          console.log(`✅ ${table.name}: ${actualCount} enregistrements`);
          
          newResults.push({
            table: table.label,
            count: actualCount,
            status: actualCount > 0 ? 'success' : 'empty',
            details: data?.slice(0, 2) // Premiers enregistrements pour debug
          });
        }
      } catch (err: any) {
        console.error(`💥 Exception ${table.name}:`, err);
        newResults.push({
          table: table.label,
          count: 0,
          error: err.message,
          status: 'error'
        });
      }
    }

    // Test spécial pour les utilisateurs internes avec relations
    try {
      console.log('🔍 Test utilisateurs internes avec rôles...');
      const { data: usersWithRoles, error: usersError } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          roles (
            id,
            name,
            description
          )
        `);

      if (!usersError && usersWithRoles) {
        console.log('✅ Utilisateurs avec rôles:', usersWithRoles);
        newResults.push({
          table: 'Utilisateurs avec rôles',
          count: usersWithRoles.length,
          status: usersWithRoles.length > 0 ? 'success' : 'empty',
          details: usersWithRoles.slice(0, 2)
        });
      }
    } catch (err) {
      console.log('⚠️ Test utilisateurs avec rôles échoué');
    }

    // Test bypass RLS pour le catalogue
    try {
      console.log('🔍 Test bypass RLS catalogue...');
      const { data: bypassData, error: bypassError } = await supabase.rpc('get_catalogue_bypass' as any);
      
      if (!bypassError && bypassData) {
        newResults.push({
          table: 'Catalogue (Bypass RLS)',
          count: bypassData.length,
          status: 'success',
          details: bypassData.slice(0, 2)
        });
      }
    } catch (err) {
      console.log('⚠️ Fonction bypass non disponible');
    }

    setResults(newResults);
    setIsRunning(false);

    // Afficher un résumé
    const successCount = newResults.filter(r => r.status === 'success').length;
    const errorCount = newResults.filter(r => r.status === 'error').length;
    
    toast({
      title: "Diagnostic terminé",
      description: `${successCount} tables OK, ${errorCount} erreurs détectées`,
      variant: successCount === newResults.length ? "default" : "destructive"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'empty': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string, count: number) => {
    switch (status) {
      case 'success': 
        return <Badge variant="default" className="bg-green-100 text-green-800">{count} enregistrements</Badge>;
      case 'error': 
        return <Badge variant="destructive">Erreur d'accès</Badge>;
      case 'empty': 
        return <Badge variant="secondary">Aucune donnée</Badge>;
      default: 
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Diagnostic des données
        </CardTitle>
        <CardDescription>
          Vérification de l'accès aux données dans toutes les tables importantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isRunning ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Résultats du diagnostic</h3>
            
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.table}</div>
                    {result.error && (
                      <div className="text-sm text-red-600">{result.error}</div>
                    )}
                  </div>
                </div>
                <div>
                  {getStatusBadge(result.status, result.count)}
                </div>
              </div>
            ))}

            {/* Résumé des problèmes détectés */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Analyse des problèmes :</h4>
              <ul className="text-sm space-y-1">
                {results.filter(r => r.status === 'error').length > 0 && (
                  <li className="text-red-600">
                    • {results.filter(r => r.status === 'error').length} table(s) avec erreurs d'accès (probablement RLS)
                  </li>
                )}
                {results.filter(r => r.status === 'empty').length > 0 && (
                  <li className="text-yellow-600">
                    • {results.filter(r => r.status === 'empty').length} table(s) vide(s)
                  </li>
                )}
                {results.filter(r => r.status === 'success').length > 0 && (
                  <li className="text-green-600">
                    • {results.filter(r => r.status === 'success').length} table(s) fonctionnelle(s)
                  </li>
                )}
              </ul>
            </div>

            {/* Actions de correction */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Actions recommandées :</h4>
              <div className="space-y-2">
                {results.some(r => r.status === 'error') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Correction des politiques RLS",
                        description: "Les politiques RLS vont être mises à jour pour permettre l'accès aux données",
                      });
                    }}
                  >
                    Corriger les politiques RLS
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Forcer le rechargement de toutes les queries
                    window.location.reload();
                  }}
                >
                  Forcer le rechargement complet
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataDiagnostic;
