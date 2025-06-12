
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBonsCommande } from '@/hooks/useBonsCommande';
import { useBonsLivraison } from '@/hooks/useBonsLivraison';

export const useBonCommandeApproval = () => {
  const { updateBonCommande } = useBonsCommande();
  const { createBonLivraison } = useBonsLivraison();

  const handleApprove = async (id: string, bon: any) => {
    try {
      console.log('🔄 Début de l\'approbation du bon de commande:', id, bon);
      
      // 1. Mettre à jour le statut du bon de commande à 'valide'
      console.log('📝 Mise à jour du statut du bon de commande...');
      await updateBonCommande.mutateAsync({
        id,
        statut: 'valide'
      });

      // 2. Récupérer les articles du bon de commande avec la relation correcte
      console.log('📦 Récupération des articles du bon de commande...');
      const { data: articlesCommande, error: articlesError } = await supabase
        .from('articles_bon_commande')
        .select(`
          *,
          catalogue!articles_bon_commande_article_id_fkey(
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

      // 3. Générer le numéro de bon de livraison
      console.log('🔢 Génération du numéro de bon de livraison...');
      const { data: numeroBLResult, error: numeroBLError } = await supabase
        .rpc('generate_bon_livraison_number', { 
          bon_commande_numero: bon.numero_bon 
        });

      if (numeroBLError) {
        console.error('❌ Erreur lors de la génération du numéro BL:', numeroBLError);
        throw new Error(`Erreur de génération du numéro BL: ${numeroBLError.message}`);
      }

      const numeroBonLivraison = numeroBLResult;
      console.log('🎯 Numéro BL généré:', numeroBonLivraison);
      
      // 4. Créer le bon de livraison
      const bonLivraisonData = {
        numero_bon: numeroBonLivraison,
        bon_commande_id: id,
        fournisseur: bon.fournisseur,
        date_livraison: new Date().toISOString(),
        statut: 'en_transit',
        taux_tva: bon.taux_tva || 20,
        transit_douane: bon.transit_douane || 0
      };

      console.log('📋 Création du bon de livraison:', bonLivraisonData);
      const newBonLivraison = await createBonLivraison.mutateAsync(bonLivraisonData);
      console.log('✅ Bon de livraison créé:', newBonLivraison);

      // 5. Transférer les articles
      if (articlesCommande && articlesCommande.length > 0) {
        console.log('🔄 Transfert des articles vers le bon de livraison...');
        
        const articlesLivraison = articlesCommande.map(article => ({
          bon_livraison_id: newBonLivraison.id,
          article_id: article.article_id,
          quantite_commandee: article.quantite,
          quantite_recue: 0,
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

      toast({
        title: "✅ Bon de commande approuvé avec succès",
        description: `Bon de livraison ${numeroBonLivraison} généré automatiquement avec ${articlesCommande?.length || 0} articles.`,
        variant: "default",
      });

      console.log('🎯 Approbation terminée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'approbation:', error);
      toast({
        title: "❌ Erreur d'approbation",
        description: error instanceof Error ? error.message : "Erreur lors de l'approbation du bon de commande.",
        variant: "destructive",
      });
    }
  };

  return { handleApprove };
};
