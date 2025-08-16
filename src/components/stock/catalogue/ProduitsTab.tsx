
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Image, TrendingUp, AlertCircle } from 'lucide-react';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/lib/currency';
import CreateProductDialog from './forms/CreateProductDialog';
import { EditProductDialog } from './forms/EditProductDialog';
import { DeleteProductDialog } from './forms/DeleteProductDialog';

const ProduitsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Utilisation du hook principal pour plus de fiabilité
  const { articles, isLoading, error } = useCatalogue();
  
  console.log('🎯 ProduitsTab - Hook results:', {
    articlesLength: articles?.length,
    isLoading,
    errorMessage: error?.message,
    searchTerm: debouncedSearch
  });

  // Filter articles based on search term
  const filteredArticles = React.useMemo(() => {
    if (!articles) {
      console.log('⚠️ No articles to filter');
      return [];
    }
    
    if (!debouncedSearch) {
      console.log('✅ Returning all articles:', articles.length);
      return articles;
    }
    
    const filtered = articles.filter(article => 
      article.nom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      article.reference?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    
    console.log('🔍 Filtered articles:', filtered.length, 'from', articles.length);
    return filtered;
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

  // Afficher l'erreur si elle existe
  if (error) {
    console.error('❌ Error in ProduitsTab:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Erreur de chargement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">
            <p>Une erreur est survenue lors du chargement du catalogue :</p>
            <p className="text-sm mt-2 font-mono bg-red-50 p-2 rounded">
              {error.message}
            </p>
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
              Produits du Catalogue
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gérez vos produits avec calcul automatique des marges
              {articles && (
                <span className="ml-2 font-medium text-blue-600">
                  ({filteredArticles.length} produit{filteredArticles.length > 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
          <CreateProductDialog />
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
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Chargement du catalogue...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="text-right">Prix Achat</TableHead>
                <TableHead className="text-right">Coût Total</TableHead>
                <TableHead className="text-right">Prix Vente</TableHead>
                <TableHead className="text-right">Marge</TableHead>
                <TableHead className="text-center">Taux Marge</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles?.map((article) => {
                const { coutTotal, marge, tauxMarge } = calculateMargin(article);
                
                return (
                  <TableRow key={article.id}>
                    <TableCell>
                      {article.image_url ? (
                        <img 
                          src={article.image_url} 
                          alt={article.nom}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{article.reference}</TableCell>
                    <TableCell>{article.nom}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(article.prix_achat || 0)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(coutTotal)}
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
                        {article.statut || 'Non défini'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditProductDialog article={article} />
                        <DeleteProductDialog article={article} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {!isLoading && filteredArticles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-12 w-12 text-gray-300" />
              {searchTerm ? (
                <div>
                  <p className="font-medium">Aucun produit trouvé</p>
                  <p className="text-sm">Aucun produit ne correspond à votre recherche "{searchTerm}"</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Aucun produit dans le catalogue</p>
                  <p className="text-sm">Ajoutez votre premier produit en cliquant sur "Nouveau Produit"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProduitsTab;
