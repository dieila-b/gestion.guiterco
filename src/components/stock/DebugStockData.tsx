
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';

const DebugStockData = () => {
  const [catalogueCount, setCatalogueCount] = useState<number>(0);
  const [stockCount, setStockCount] = useState<number>(0);
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [unitesCount, setUnitesCount] = useState<number>(0);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDebugData = async () => {
    setIsLoading(true);
    try {
      // Compter les articles du catalogue
      const { count: catalogueCountResult } = await supabase
        .from('catalogue')
        .select('*', { count: 'exact', head: true });
      setCatalogueCount(catalogueCountResult || 0);

      // Compter le stock principal
      const { count: stockCountResult } = await supabase
        .from('stock_principal')
        .select('*', { count: 'exact', head: true });
      setStockCount(stockCountResult || 0);

      // Compter les catégories
      const { count: categoriesCountResult } = await supabase
        .from('categories_catalogue')
        .select('*', { count: 'exact', head: true });
      setCategoriesCount(categoriesCountResult || 0);

      // Compter les unités
      const { count: unitesCountResult } = await supabase
        .from('unites_catalogue')
        .select('*', { count: 'exact', head: true });
      setUnitesCount(unitesCountResult || 0);

      // Récupérer un échantillon de données avec relations
      const { data: sampleDataResult } = await supabase
        .from('stock_principal')
        .select(`
          id,
          quantite_disponible,
          article:catalogue(
            id,
            nom,
            reference,
            categorie_article:categories_catalogue(nom),
            unite_article:unites_catalogue(nom)
          ),
          entrepot:entrepots(
            id,
            nom
          )
        `)
        .limit(5);
      
      setSampleData(sampleDataResult || []);
      
      console.log('Debug data:', {
        catalogue: catalogueCountResult,
        stock: stockCountResult,
        categories: categoriesCountResult,
        unites: unitesCountResult,
        sample: sampleDataResult
      });
      
    } catch (error) {
      console.error('Error fetching debug data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Debug des données Supabase
          <Button 
            onClick={fetchDebugData} 
            disabled={isLoading}
            variant="outline" 
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{catalogueCount}</div>
            <div className="text-sm text-blue-800">Articles catalogue</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{stockCount}</div>
            <div className="text-sm text-green-800">Entrées stock</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-600">{categoriesCount}</div>
            <div className="text-sm text-purple-800">Catégories</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded">
            <div className="text-2xl font-bold text-orange-600">{unitesCount}</div>
            <div className="text-sm text-orange-800">Unités</div>
          </div>
        </div>
        
        {sampleData.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Échantillon de données stock:</h4>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugStockData;
