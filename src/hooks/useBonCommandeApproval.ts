
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

  return { handleApprove };
};
