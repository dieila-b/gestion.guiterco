import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { BonCommande } from '@/types/purchases';

export const useBonsCommande = () => {
  const queryClient = useQueryClient();

  const { data: bonsCommande, isLoading, error, refetch } = useQuery({
    queryKey: ['bons-commande'],
    queryFn: async () => {
      console.log('🔍 Fetching bons de commande with full relations...');
      
      const { data, error } = await supabase
        .from('bons_de_commande')
        .select(`
          *,
          fournisseur_data:fournisseurs!bons_de_commande_fournisseur_id_fkey (
            id,
            nom_entreprise,
            nom,
            email,
            telephone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching bons de commande:', error);
        throw error;
      }
      
      console.log('✅ Fetched bons de commande:', data?.length || 0, 'records');
      console.log('📋 Sample data:', data?.[0]);
      
      // Transformer les données pour s'assurer que le nom du fournisseur est correct
      const transformedData = data?.map(bon => ({
        ...bon,
        fournisseur: bon.fournisseur_data?.nom_entreprise || 
                    bon.fournisseur_data?.nom || 
                    bon.fournisseur || 
                    'Fournisseur inconnu'
      })) || [];
      
      return transformedData as BonCommande[];
    },
    retry: 3,
    retryDelay: 1000,
  });

  const createBonCommande = useMutation({
    mutationFn: async (bonCommandeData: any) => {
      console.log('🔄 Création d\'un bon de commande avec numérotation automatique...');
      console.log('📝 Données du bon de commande:', bonCommandeData);
      
      // Extraire les articles de l'objet bonCommande
      const { articles, ...bonCommandeMainData } = bonCommandeData;
      
      console.log('🎯 Insertion du bon de commande - le numéro sera généré automatiquement...');
      
      // Démarrer une transaction
      const { data: newBonCommande, error: bonCommandeError } = await supabase
        .from('bons_de_commande')
        .insert([bonCommandeMainData])
        .select()
        .single();

      if (bonCommandeError) {
        console.error('❌ Erreur lors de la création du bon de commande:', bonCommandeError);
        throw new Error(`Erreur lors de la création du bon de commande: ${bonCommandeError.message}`);
      }

      console.log('✅ Bon de commande créé avec numéro auto-généré:', newBonCommande.numero_bon);
      console.log('📋 Détails du bon de commande créé:', newBonCommande);

      // Si des articles sont fournis, les insérer dans articles_bon_commande
      if (articles && articles.length > 0) {
        console.log('📦 Insertion des articles dans le bon de commande...');
        console.log('🔢 Nombre d\'articles à insérer:', articles.length);
        
        const articlesData = articles.map((article: any) => ({
          bon_commande_id: newBonCommande.id,
          article_id: article.article_id,
          quantite: Number(article.quantite),
          prix_unitaire: Number(article.prix_unitaire),
          montant_ligne: Number(article.montant_ligne)
        }));

        console.log('📊 Données des articles formatées:', articlesData);

        const { error: articlesError } = await supabase
          .from('articles_bon_commande')
          .insert(articlesData);

        if (articlesError) {
          console.error('❌ Erreur lors de l\'insertion des articles:', articlesError);
          
          // Supprimer le bon de commande créé en cas d'erreur sur les articles
          await supabase
            .from('bons_de_commande')
            .delete()
            .eq('id', newBonCommande.id);
            
          throw new Error(`Erreur lors de l'ajout des articles: ${articlesError.message}`);
        } else {
          console.log('✅ Articles insérés avec succès dans le bon de commande');
        }
      }

      return newBonCommande;
    },
    onSuccess: (newBonCommande) => {
      queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-commande-articles-counts'] });
      toast({
        title: "✅ Bon de commande créé avec succès",
        description: `Numéro généré: ${newBonCommande.numero_bon}`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erreur dans la mutation createBonCommande:', error);
      toast({
        title: "❌ Erreur de création",
        description: error.message || "Erreur lors de la création du bon de commande",
        variant: "destructive",
      });
    }
  });

  const updateBonCommande = useMutation({
    mutationFn: async ({ id, ...bon }: Partial<BonCommande> & { id: string }) => {
      const { data, error } = await supabase
        .from('bons_de_commande')
        .update(bon)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BonCommande;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      toast({
        title: "Bon de commande mis à jour avec succès",
        variant: "default",
      });
    }
  });

  const deleteBonCommande = useMutation({
    mutationFn: async (id: string) => {
      // D'abord supprimer les articles liés (cascade devrait fonctionner mais on s'assure)
      const { error: articlesError } = await supabase
        .from('articles_bon_commande')
        .delete()
        .eq('bon_commande_id', id);
      
      if (articlesError) {
        console.error('Error deleting articles:', articlesError);
      }
      
      // Ensuite supprimer le bon de commande
      const { error } = await supabase
        .from('bons_de_commande')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-commande-articles-counts'] });
      toast({
        title: "Bon de commande supprimé avec succès",
        variant: "default",
      });
    }
  });

  return {
    bonsCommande,
    isLoading,
    error,
    refetch,
    createBonCommande,
    updateBonCommande,
    deleteBonCommande
  };
};
