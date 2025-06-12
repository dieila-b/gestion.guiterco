
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useBonsCommande, useBonsLivraison } from '@/hooks/usePurchases';
import { useAllBonCommandeArticles } from '@/hooks/useBonCommandeArticles';
import { format } from 'date-fns';
import { CreateBonCommandeDialog } from './CreateBonCommandeDialog';
import { BonCommandeTable } from './BonCommandeTable';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BonsCommande = () => {
  const { bonsCommande, isLoading, updateBonCommande, deleteBonCommande } = useBonsCommande();
  const { createBonLivraison } = useBonsLivraison();
  const { articlesCounts, isLoading: loadingArticles } = useAllBonCommandeArticles();
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = async (id: string, bon: any) => {
    try {
      console.log('Approving bon de commande:', id, bon);
      
      // 1. Mettre à jour le statut du bon de commande
      await updateBonCommande.mutateAsync({
        id,
        statut: 'valide'
      });

      // 2. Récupérer les articles du bon de commande
      const { data: articlesCommande, error: articlesError } = await supabase
        .from('articles_bon_commande')
        .select('*')
        .eq('bon_commande_id', id);

      if (articlesError) {
        console.error('Error fetching articles bon commande:', articlesError);
        throw articlesError;
      }

      console.log('Articles du bon de commande:', articlesCommande);

      // 3. Générer le bon de livraison avec un numéro basé sur le bon de commande
      const numeroBonLivraison = `BL-${bon.numero_bon.replace('BC-', '')}`; // Garde la même base numérique
      
      const bonLivraisonData = {
        numero_bon: numeroBonLivraison,
        bon_commande_id: id,
        fournisseur: bon.fournisseur,
        date_livraison: new Date().toISOString(),
        statut: 'en_transit'
      };

      console.log('Creating bon de livraison:', bonLivraisonData);

      const newBonLivraison = await createBonLivraison.mutateAsync(bonLivraisonData);
      
      console.log('Bon de livraison créé:', newBonLivraison);

      // 4. Copier les articles du bon de commande vers le bon de livraison
      if (articlesCommande && articlesCommande.length > 0) {
        const articlesLivraison = articlesCommande.map(article => ({
          bon_livraison_id: newBonLivraison.id,
          article_id: article.article_id,
          quantite_commandee: article.quantite,
          quantite_recue: 0, // Initialement 0, sera mise à jour lors de la réception
          prix_unitaire: article.prix_unitaire,
          montant_ligne: article.montant_ligne
        }));

        console.log('Inserting articles into bon de livraison:', articlesLivraison);

        const { error: insertArticlesError } = await supabase
          .from('articles_bon_livraison')
          .insert(articlesLivraison);

        if (insertArticlesError) {
          console.error('Error inserting articles bon livraison:', insertArticlesError);
          throw insertArticlesError;
        }

        console.log('Articles copiés avec succès vers le bon de livraison');
      }
      
      toast({
        title: "Bon de commande approuvé",
        description: `Un bon de livraison ${numeroBonLivraison} a été généré avec ${articlesCommande?.length || 0} articles.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error approving bon de commande:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'approbation du bon de commande.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bon de commande ?')) {
      try {
        await deleteBonCommande.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting bon de commande:', error);
      }
    }
  };

  const filteredBons = bonsCommande?.filter(bon =>
    bon.numero_bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.fournisseur.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Bons de commande</h2>
          <p className="text-gray-400">Gérez vos bons de commande fournisseurs</p>
        </div>
        <CreateBonCommandeDialog />
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Liste des bons de commande</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BonCommandeTable
            bons={filteredBons}
            articlesCounts={articlesCounts}
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
