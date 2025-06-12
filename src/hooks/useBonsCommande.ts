
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
      console.log('Creating bon de commande:', bonCommande);
      
      // Extraire les articles de l'objet bonCommande
      const { articles, ...bonCommandeData } = bonCommande;
      
      // Le numéro sera généré automatiquement par le trigger de base de données
      const { data: newBonCommande, error: bonCommandeError } = await supabase
        .from('bons_de_commande')
        .insert([bonCommandeData as any])
        .select()
        .single();

      if (bonCommandeError) {
        console.error('Error creating bon de commande:', bonCommandeError);
        throw bonCommandeError;
      }

      console.log('Bon de commande created with auto-generated number:', newBonCommande);

      // Si des articles sont fournis, les insérer dans articles_bon_commande
      if (articles && articles.length > 0) {
        console.log('Inserting articles:', articles);
        
        const articlesData = articles.map(article => ({
          bon_commande_id: newBonCommande.id,
          article_id: article.article_id,
          quantite: article.quantite,
          prix_unitaire: Number(article.prix_unitaire),
          montant_ligne: Number(article.montant_ligne)
        }));

        const { error: articlesError } = await supabase
          .from('articles_bon_commande')
          .insert(articlesData);

        if (articlesError) {
          console.error('Error inserting articles:', articlesError);
          toast({
            title: "Attention",
            description: "Le bon de commande a été créé mais il y a eu un problème avec les articles.",
            variant: "destructive",
          });
        } else {
          console.log('Articles inserted successfully');
        }
      }

      return newBonCommande;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-commande-articles-counts'] });
      toast({
        title: "Succès",
        description: "Bon de commande créé avec succès avec numéro auto-généré",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('Error in createBonCommande mutation:', error);
      toast({
        title: "Erreur",
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
