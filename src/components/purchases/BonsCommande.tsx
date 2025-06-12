
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBonsCommande } from '@/hooks/useBonsCommande';
import { useAllBonCommandeArticles } from '@/hooks/useBonCommandeArticles';
import { useBonCommandeApproval } from '@/hooks/useBonCommandeApproval';
import { useBonCommandeDelete } from '@/hooks/useBonCommandeDelete';
import { BonCommandeTable } from './BonCommandeTable';
import { BonCommandeHeader } from './BonCommandeHeader';
import { BonCommandeSearch } from './BonCommandeSearch';

const BonsCommande = () => {
  const { bonsCommande, isLoading } = useBonsCommande();
  const { data: articlesCounts, isLoading: loadingArticles } = useAllBonCommandeArticles();
  const { handleApprove } = useBonCommandeApproval();
  const { handleDelete } = useBonCommandeDelete();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBons = bonsCommande?.filter(bon =>
    bon.numero_bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.fournisseur.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <BonCommandeHeader />

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Liste des bons de commande</CardTitle>
            <div className="flex items-center space-x-2">
              <BonCommandeSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BonCommandeTable
            bons={filteredBons}
            articlesCounts={articlesCounts || {}}
            onApprove={handleApprove}
            onDelete={handleDelete}
          />
          
          {filteredBons.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucun bon de commande trouvé'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BonsCommande;
