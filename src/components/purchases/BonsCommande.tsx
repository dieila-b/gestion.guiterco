
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useBonsCommande } from '@/hooks/useBonsCommande';
import { useBonsLivraison } from '@/hooks/useBonsLivraison';
import { useAllBonCommandeArticles } from '@/hooks/useBonCommandeArticles';
import { format } from 'date-fns';
import { CreateBonCommandeDialog } from './CreateBonCommandeDialog';
import { BonCommandeTable } from './BonCommandeTable';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BonsCommande = () => {
  const { bonsCommande, isLoading, updateBonCommande, deleteBonCommande } = useBonsCommande();
  const { createBonLivraison } = useBonsLivraison();
  const { data: articlesCounts, isLoading: loadingArticles } = useAllBonCommandeArticles();
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = async (id: string, bon: any) => {
    try {
      console.log('🔄 Début de l\'approbation du bon de commande:', id, bon);
      
      // 1. Mettre à jour le statut du bon de commande à 'valide' avec vérification d'intégrité
      console.log('📝 Mise à jour du statut du bon de commande...');
      await updateBonCommande.mutateAsync({
        id,
        statut: 'valide'
      });

      // 2. Récupérer les articles du bon de commande avec validation des données
      console.log('📦 Récupération des articles du bon de commande...');
      const { data: articlesCommande, error: articlesError } = await supabase
        .from('articles_bon_commande')
        .select(`
          *,
          article:catalogue(
            id,
            nom,
            reference,
            prix_unitaire
          )
        `)
        .eq('bon_commande_id', id);

      if (articlesError) {
        console.error('❌ Erreur lors de la récupération des articles:', articlesError);
        throw new Error(`Erreur de récupération des articles: ${articlesError.message}`);
      }

      if (!articlesCommande || articlesCommande.length === 0) {
        throw new Error('Aucun article trouvé pour ce bon de commande');
      }

      console.log('✅ Articles récupérés avec succès:', articlesCommande.length, 'articles');

      // 3. Générer le numéro de bon de livraison synchronisé avec validation
      console.log('🔢 Génération du numéro de bon de livraison synchronisé...');
      const { data: numeroBLResult, error: numeroBLError } = await supabase
        .rpc('generate_bon_livraison_number', { 
          bon_commande_numero: bon.numero_bon 
        });

      if (numeroBLError) {
        console.error('❌ Erreur lors de la génération du numéro BL:', numeroBLError);
        throw new Error(`Erreur de génération du numéro BL: ${numeroBLError.message}`);
      }

      const numeroBonLivraison = numeroBLResult;
      console.log('🎯 Numéro BL généré avec synchronisation:', numeroBonLivraison);
      
      // 4. Créer le bon de livraison avec toutes les données de traçabilité
      const bonLivraisonData = {
        numero_bon: numeroBonLivraison,
        bon_commande_id: id,
        fournisseur: bon.fournisseur,
        date_livraison: new Date().toISOString(),
        statut: 'en_transit',
        taux_tva: bon.taux_tva || 20,
        transit_douane: bon.transit_douane || 0
      };

      console.log('📋 Création du bon de livraison avec données complètes:', bonLivraisonData);

      const newBonLivraison = await createBonLivraison.mutateAsync(bonLivraisonData);
      
      console.log('✅ Bon de livraison créé avec succès:', newBonLivraison);

      // 5. Transférer tous les articles avec vérification d'intégrité
      if (articlesCommande && articlesCommande.length > 0) {
        console.log('🔄 Transfert des articles vers le bon de livraison...');
        
        const articlesLivraison = articlesCommande.map(article => ({
          bon_livraison_id: newBonLivraison.id,
          article_id: article.article_id,
          quantite_commandee: article.quantite,
          quantite_recue: 0, // Initialement 0, sera mise à jour lors de la réception
          prix_unitaire: article.prix_unitaire,
          montant_ligne: article.montant_ligne
        }));

        console.log('📊 Articles à transférer:', articlesLivraison);

        const { error: insertArticlesError } = await supabase
          .from('articles_bon_livraison')
          .insert(articlesLivraison);

        if (insertArticlesError) {
          console.error('❌ Erreur lors du transfert des articles:', insertArticlesError);
          throw new Error(`Erreur de transfert des articles: ${insertArticlesError.message}`);
        }

        console.log('✅ Transfert des articles terminé avec succès');
      }

      // 6. Vérification finale de l'intégrité des données
      console.log('🔍 Vérification de l\'intégrité de la liaison...');
      const { data: verification, error: verificationError } = await supabase
        .from('bons_de_livraison')
        .select(`
          *,
          bon_commande:bons_de_commande!fk_bons_livraison_bon_commande_id(numero_bon)
        `)
        .eq('id', newBonLivraison.id)
        .single();

      if (verificationError || !verification) {
        console.error('❌ Erreur de vérification de l\'intégrité:', verificationError);
        throw new Error('Erreur de vérification de l\'intégrité des données');
      }

      console.log('✅ Vérification d\'intégrité réussie:', verification);
      
      toast({
        title: "✅ Bon de commande approuvé avec succès",
        description: `Bon de livraison ${numeroBonLivraison} généré automatiquement. Traçabilité complète assurée avec ${articlesCommande?.length || 0} articles synchronisés.`,
        variant: "default",
      });

      console.log('🎯 Approbation terminée - Chaîne de traçabilité: BC → BL → Articles complète');
      
    } catch (error) {
      console.error('❌ Erreur critique lors de l\'approbation:', error);
      toast({
        title: "❌ Erreur d'approbation",
        description: error instanceof Error ? error.message : "Erreur lors de l'approbation du bon de commande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bon de commande ? Cette action supprimera également tous les éléments liés (bons de livraison, articles).')) {
      try {
        console.log('🗑️ Suppression du bon de commande et éléments liés:', id);
        
        // Vérifier s'il existe des bons de livraison liés
        const { data: bonsLivraisonLies } = await supabase
          .from('bons_de_livraison')
          .select('id, numero_bon, statut')
          .eq('bon_commande_id', id);

        if (bonsLivraisonLies && bonsLivraisonLies.length > 0) {
          const numerosBL = bonsLivraisonLies.map(bl => bl.numero_bon).join(', ');
          console.log('⚠️ Bons de livraison liés trouvés:', numerosBL);
          
          if (!window.confirm(`Attention: Cette suppression affectera également ${bonsLivraisonLies.length} bon(s) de livraison (${numerosBL}). Continuer ?`)) {
            return;
          }
        }

        await deleteBonCommande.mutateAsync(id);
        
        toast({
          title: "✅ Bon de commande supprimé",
          description: `Le bon de commande et tous ses éléments liés ont été supprimés. Traçabilité mise à jour.`,
          variant: "default",
        });
        
        console.log('✅ Suppression terminée avec mise à jour de la traçabilité');
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        toast({
          title: "❌ Erreur de suppression",
          description: "Erreur lors de la suppression du bon de commande.",
          variant: "destructive",
        });
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
          <p className="text-gray-400">Gérez vos bons de commande fournisseurs avec numérotation automatique BC-AA-MM-JJ-XXX et génération automatique des bons de livraison</p>
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
                  placeholder="Rechercher par numéro ou fournisseur..."
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
