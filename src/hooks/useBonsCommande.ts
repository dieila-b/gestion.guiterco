
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { BonCommande } from '@/types/purchases';

export const useBonsCommande = () => {
  const queryClient = useQueryClient();

  const { data: bonsCommande, isLoading, error, refetch } = useQuery({
    queryKey: ['bons-commande'],
    queryFn: async () => {
      console.log('Fetching bons de commande...');
      const { data, error } = await supabase
        .from('bons_de_commande')
        .select(`
          *,
          fournisseur_data:fournisseur_id (
            id,
            nom_entreprise,
            nom,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bons de commande:', error);
        throw error;
      }
      
      console.log('Fetched bons de commande with relations:', data);
      return data as BonCommande[];
    },
  });

  const createBonCommande = useMutation({
    mutationFn: async (bonCommande: Omit<BonCommande, 'id' | 'created_at' | 'updated_at' | 'numero_bon'> & { articles?: any[] }) => {
      console.log('🔄 Création d\'un bon de commande avec numérotation automatique...');
      console.log('📝 Données du bon de commande:', bonCommande);
      
      // Extraire les articles de l'objet bonCommande
      const { articles, ...bonCommandeData } = bonCommande;
      
      // Le numéro sera généré automatiquement par le trigger de base de données selon le format BC-AA-MM-JJ-XXX
      console.log('🎯 Insertion du bon de commande - le numéro sera généré automatiquement...');
      const { data: newBonCommande, error: bonCommandeError } = await supabase
        .from('bons_de_commande')
        .insert([bonCommandeData as any])
        .select()
        .single();

      if (bonCommandeError) {
        console.error('❌ Erreur lors de la création du bon de commande:', bonCommandeError);
        throw bonCommandeError;
      }

      console.log('✅ Bon de commande créé avec numéro auto-généré:', newBonCommande.numero_bon);
      console.log('📋 Détails du bon de commande créé:', newBonCommande);

      // Si des articles sont fournis, les insérer dans articles_bon_commande
      if (articles && articles.length > 0) {
        console.log('📦 Insertion des articles dans le bon de commande...');
        console.log('🔢 Nombre d\'articles à insérer:', articles.length);
        
        const articlesData = articles.map(article => ({
          bon_commande_id: newBonCommande.id,
          article_id: article.article_id,
          quantite: article.quantite,
          prix_unitaire: Number(article.prix_unitaire),
          montant_ligne: Number(article.montant_ligne)
        }));

        console.log('📊 Données des articles formatées:', articlesData);

        const { error: articlesError } = await supabase
          .from('articles_bon_commande')
          .insert(articlesData);

        if (articlesError) {
          console.error('❌ Erreur lors de l\'insertion des articles:', articlesError);
          toast({
            title: "⚠️ Attention",
            description: "Le bon de commande a été créé mais il y a eu un problème avec les articles.",
            variant: "destructive",
          });
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
        description: `Numéro généré automatiquement: ${newBonCommande.numero_bon} (format BC-AA-MM-JJ-XXX)`,
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
