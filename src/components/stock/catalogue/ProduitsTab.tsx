
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Image } from 'lucide-react';
import { useCatalogueOptimized } from '@/hooks/useCatalogueOptimized';
import { useDebounce } from '@/hooks/useDebounce';
import CreateProductDialog from './forms/CreateProductDialog';
import { EditProductDialog } from './forms/EditProductDialog';
import { DeleteProductDialog } from './forms/DeleteProductDialog';

const ProduitsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { articles, isLoading } = useCatalogueOptimized(1, 50, debouncedSearch);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Produits du Catalogue</CardTitle>
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
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix Unitaire d'Achat (GNF)</TableHead>
                <TableHead>Prix Unitaire de Vente (GNF)</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles?.map((article) => (
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
                  <TableCell>
                    {article.categorie && (
                      <Badge variant="outline">{article.categorie}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {article.prix_achat ? `${article.prix_achat.toLocaleString()} GNF` : '-'}
                  </TableCell>
                  <TableCell>
                    {article.prix_vente ? `${article.prix_vente.toLocaleString()} GNF` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Actif</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditProductDialog article={article} />
                      <DeleteProductDialog article={article} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && (!articles || articles.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Aucun produit trouvé pour cette recherche' : 'Aucun produit dans le catalogue'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProduitsTab;
