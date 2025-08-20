
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCatalogueBypass } from '@/hooks/useCatalogueBypass';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/lib/currency';

const ProduitsTabBypass = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { articles, isLoading, error, forceRefresh } = useCatalogueBypass();
  
  console.log('🔓 ProduitsTabBypass - Articles:', {
    count: articles?.length,
    isLoading,
    hasError: !!error,
    errorMessage: error?.message
  });

  // Filter articles based on search term
  const filteredArticles = React.useMemo(() => {
    if (!articles) return [];
    
    if (!debouncedSearch) return articles;
    
    return articles.filter(article => 
      article.nom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      article.reference?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      article.categorie?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [articles, debouncedSearch]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Erreur Mode Contournement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 space-y-4">
            <p>Même le mode contournement a échoué :</p>
            <p className="text-sm font-mono bg-red-50 p-3 rounded border">
              {error.message}
            </p>
            <div className="flex gap-2">
              <Button onClick={forceRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Mode Contournement RLS
              <Badge variant="destructive" className="ml-2">
                DEBUG
              </Badge>
            </CardTitle>
            <p className="text-sm text-red-600">
              Mode de récupération forcée des données - {filteredArticles.length} produit{filteredArticles.length > 1 ? 's' : ''} trouvé{filteredArticles.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={forceRefresh} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Chargement...' : 'Actualiser'}
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="text-muted-foreground">Contournement en cours...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead className="text-right">Prix Achat</TableHead>
                  <TableHead className="text-right">Prix Vente</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-mono text-sm">{article.reference}</TableCell>
                    <TableCell className="font-medium">{article.nom}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {article.categorie || 'Non classé'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {article.unite_mesure || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(article.prix_achat || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(article.prix_vente || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.statut === 'actif' ? 'default' : 'secondary'}>
                        {article.statut || 'Actif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {article.created_at ? new Date(article.created_at).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-300 mx-auto" />
            <div>
              <p className="font-medium text-red-600">
                {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit récupéré même avec contournement'}
              </p>
              <p className="text-sm text-red-500">
                {searchTerm 
                  ? `Aucun produit ne correspond à "${searchTerm}"`
                  : 'Cela indique un problème plus profond avec la base de données.'
                }
              </p>
              <Button onClick={forceRefresh} variant="outline" size="sm" className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer le contournement
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProduitsTabBypass;
