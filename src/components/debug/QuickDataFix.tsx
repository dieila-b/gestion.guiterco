import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, Users, Package, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface TableStat {
  name: 'catalogue' | 'clients' | 'utilisateurs_internes' | 'entrepots';
  count: number;
  status: 'loading' | 'success' | 'error';
  error?: string;
  icon: React.ReactNode;
}

const QuickDataFix = () => {
  const [stats, setStats] = useState<TableStat[]>([
    { name: 'catalogue', count: 0, status: 'loading', icon: <Package className="h-4 w-4" /> },
    { name: 'clients', count: 0, status: 'loading', icon: <Users className="h-4 w-4" /> },
    { name: 'utilisateurs_internes', count: 0, status: 'loading', icon: <Users className="h-4 w-4" /> },
    { name: 'entrepots', count: 0, status: 'loading', icon: <Building className="h-4 w-4" /> },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadTableStats = async () => {
    const newStats = await Promise.all(
      stats.map(async (stat) => {
        try {
          const { count, error } = await supabase
            .from(stat.name)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            return { 
              ...stat, 
              status: 'error' as const, 
              count: 0,
              error: error.message 
            };
          }
          
          return { 
            ...stat, 
            status: 'success' as const, 
            count: count || 0 
          };
        } catch (err) {
          return { 
            ...stat, 
            status: 'error' as const, 
            count: 0,
            error: (err as Error).message 
          };
        }
      })
    );
    
    setStats(newStats);
  };

  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      // Invalider tous les caches React Query
      await queryClient.invalidateQueries();
      
      // Recharger les statistiques
      await loadTableStats();
      
      // Forcer un refetch de toutes les requêtes actives
      await queryClient.refetchQueries();
      
      toast({
        title: "Actualisation terminée",
        description: "Toutes les données ont été rechargées",
      });
    } catch (error) {
      toast({
        title: "Erreur d'actualisation",
        description: "Impossible de recharger toutes les données",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fixTable = async (tableName: TableStat['name']) => {
    try {
      // Essayer de compter les enregistrements avec différentes stratégies
      console.log(`🔧 Tentative de correction pour la table: ${tableName}`);
      
      // Stratégie 1: Requête simple
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        toast({
          title: `Erreur ${tableName}`,
          description: `Impossible d'accéder à la table: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: `Table ${tableName}`,
        description: "Accès réussi - rechargement des données...",
      });
      
      // Recharger les stats
      await loadTableStats();
      
    } catch (error) {
      toast({
        title: `Erreur ${tableName}`,
        description: `Correction échouée: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadTableStats();
  }, []);

  const getStatusBadge = (stat: TableStat) => {
    if (stat.status === 'loading') {
      return <Badge variant="secondary">Chargement...</Badge>;
    }
    if (stat.status === 'error') {
      return <Badge variant="destructive">Erreur</Badge>;
    }
    if (stat.count === 0) {
      return <Badge variant="outline">Vide</Badge>;
    }
    return <Badge variant="default">{stat.count}</Badge>;
  };

  const getStatusIcon = (stat: TableStat) => {
    if (stat.status === 'loading') {
      return <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />;
    }
    if (stat.status === 'error') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Correction Rapide des Données
          </CardTitle>
          <Button 
            onClick={refreshAllData}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <span className="text-sm font-medium capitalize">
                    {stat.name.replace('_', ' ')}
                  </span>
                </div>
                {getStatusIcon(stat)}
              </div>
              
              <div className="flex items-center justify-between">
                {getStatusBadge(stat)}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => fixTable(stat.name)}
                  disabled={stat.status === 'loading'}
                >
                  Test
                </Button>
              </div>
              
              {stat.error && (
                <p className="text-xs text-red-600 mt-2 truncate" title={stat.error}>
                  {stat.error}
                </p>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
          <p className="font-medium">Aide rapide:</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
            <li>Si une table affiche "Erreur", cliquez sur "Test" pour diagnostiquer</li>
            <li>Si une table est "Vide", vérifiez vos données dans Supabase</li>
            <li>Utilisez "Actualiser tout" pour recharger toutes les données</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickDataFix;