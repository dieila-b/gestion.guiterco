
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Image, TrendingUp, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCatalogueOptimized } from '@/hooks/useCatalogueOptimized';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/lib/currency';

const ProduitsTabOptimized = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { articles, isLoading, error, forceRefresh } = useCatalogueOptimized();
  
  console.log('🎯 ProduitsTabOptimized - Articles:', {
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

  const calculateMargin = (article: any) => {
    const prixAchat = article.prix_achat || 0;
    const fraisTotal = (article.frais_logistique || 0) + 
                      (article.frais_douane || 0) + 
                      (article.frais_transport || 0) + 
                      (article.autres_frais || 0);
    const coutTotal = prixAchat + fraisTotal;
    const prixVente = article.prix_vente || 0;
    const marge = prixVente - coutTotal;
    const tauxMarge = coutTotal > 0 ? (marge / coutTotal) * 100 : 0;

    return { coutTotal, marge, tauxMarge };
  };

  const getMarginBadgeColor = (taux: number) => {
    if (taux >= 30) return 'bg-green-100 text-green-800';
    if (taux >= 20) return 'bg-blue-100 text-blue-800';
    if (taux >= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Erreur de chargement du catalogue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 space-y-4">
            <p>Une erreur est survenue lors du chargement :</p>
            <p className="text-sm font-mono bg-red-50 p-3 rounded border">
              {error.message}
            </p>
            <div className="flex gap-2">
              <Button onClick={forceRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recharger
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
              <Zap className="h-5 w-5 text-blue-600" />
              Catalogue Optimisé
              <Badge variant="outline" className="ml-2">
                {filteredArticles.length} produit{filteredArticles.length > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Version optimisée avec synchronisation automatique
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Chargement du catalogue optimisé...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead className="text-right">Prix Achat</TableHead>
                  <TableHead className="text-right">Prix Vente</TableHead>
                  <TableHead className="text-right">Marge</TableHead>
                  <TableHead className="text-center">Taux</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => {
                  const { marge, tauxMarge } = calculateMargin(article);
                  
                  return (
                    <TableRow key={article.id}>
                      <TableCell>
                        {article.image_url ? (
                          <img 
                            src={article.image_url} 
                            alt={article.nom}
                            className="w-10 h-10 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                            <Image className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{article.reference}</TableCell>
                      <TableCell className="font-medium">{article.nom}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {article.categorie_article?.nom || article.categorie || 'Non classé'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {article.unite_article?.nom || article.unite_mesure || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(article.prix_achat || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(article.prix_vente || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={marge >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(marge)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getMarginBadgeColor(tauxMarge)}>
                          {tauxMarge.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={article.statut === 'actif' ? 'default' : 'secondary'}>
                          {article.statut || 'Actif'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto" />
            <div>
              <p className="font-medium">
                {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit dans le catalogue'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? `Aucun produit ne correspond à "${searchTerm}"`
                  : 'Le catalogue semble vide. Vérifiez la connexion à la base de données.'
                }
              </p>
              <Button onClick={forceRefresh} variant="outline" size="sm" className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recharger
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProduitsTabOptimized;
