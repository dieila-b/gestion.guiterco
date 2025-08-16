
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const seedTestData = async () => {
    setIsSeeding(true);
    setResults([]);
    
    try {
      console.log('🌱 Création de données de test...');
      
      // Créer une catégorie de test
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories_catalogue')
        .upsert({
          nom: 'Test Category',
          description: 'Catégorie créée automatiquement pour les tests',
          couleur: '#3B82F6',
          statut: 'actif'
        }, { 
          onConflict: 'nom',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Erreur création catégorie:', categoryError);
        setResults(prev => [...prev, { type: 'error', message: `Erreur catégorie: ${categoryError.message}` }]);
      } else {
        setResults(prev => [...prev, { type: 'success', message: `Catégorie créée: ${categoryData.nom}` }]);
      }

      // Créer des produits de test
      const testProducts = [
        {
          nom: 'Produit Test 1',
          reference: 'TEST-001',
          description: 'Premier produit de test créé automatiquement',
          prix_achat: 10.00,
          prix_vente: 15.00,
          categorie: 'Test Category',
          categorie_id: categoryData?.id,
          unite_mesure: 'unité',
          statut: 'actif',
          seuil_alerte: 5
        },
        {
          nom: 'Produit Test 2',
          reference: 'TEST-002',
          description: 'Deuxième produit de test créé automatiquement',
          prix_achat: 25.00,
          prix_vente: 35.00,
          categorie: 'Test Category',
          categorie_id: categoryData?.id,
          unite_mesure: 'kg',
          statut: 'actif',
          seuil_alerte: 10
        },
        {
          nom: 'Produit Test 3',
          reference: 'TEST-003',
          description: 'Troisième produit de test créé automatiquement',
          prix_achat: 5.50,
          prix_vente: 8.75,
          categorie: 'Test Category',
          categorie_id: categoryData?.id,
          unite_mesure: 'litre',
          statut: 'actif',
          seuil_alerte: 20
        }
      ];

      for (const product of testProducts) {
        try {
          const { data: productData, error: productError } = await supabase
            .from('catalogue')
            .upsert(product, { 
              onConflict: 'reference',
              ignoreDuplicates: false 
            })
            .select()
            .single();

          if (productError) {
            console.error(`Erreur création produit ${product.reference}:`, productError);
            setResults(prev => [...prev, { 
              type: 'error', 
              message: `Erreur produit ${product.reference}: ${productError.message}` 
            }]);
          } else {
            setResults(prev => [...prev, { 
              type: 'success', 
              message: `Produit créé: ${productData.nom} (${productData.reference})` 
            }]);
          }
        } catch (err) {
          console.error(`Exception produit ${product.reference}:`, err);
          setResults(prev => [...prev, { 
            type: 'error', 
            message: `Exception produit ${product.reference}: ${(err as Error).message}` 
          }]);
        }
      }

      toast({
        title: "Création terminée",
        description: "Les données de test ont été créées",
      });

    } catch (error) {
      console.error('Erreur générale lors de la création:', error);
      setResults(prev => [...prev, { 
        type: 'error', 
        message: `Erreur générale: ${(error as Error).message}` 
      }]);
      toast({
        title: "Erreur de création",
        description: "Impossible de créer les données de test",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Créateur de Données Test
          </CardTitle>
          <Button 
            onClick={seedTestData} 
            disabled={isSeeding}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSeeding ? 'animate-spin' : ''}`} />
            {isSeeding ? 'Création en cours...' : 'Créer données test'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Attention</span>
          </div>
          <p className="text-sm text-yellow-700">
            Cette fonction crée des données de test dans votre base de données. 
            Utilisez uniquement si le catalogue est vide ou pour des tests.
          </p>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Résultats de création :</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant={result.type === 'success' ? 'default' : 'destructive'}>
                  {result.type.toUpperCase()}
                </Badge>
                <span className="text-sm">{result.message}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataSeeder;
