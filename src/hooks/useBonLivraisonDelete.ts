
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useBonLivraisonDelete = () => {
  const queryClient = useQueryClient();

  const deleteBonLivraison = useMutation({
    mutationFn: async (bonLivraisonId: string) => {
      console.log('🗑️ Suppression du bon de livraison:', bonLivraisonId);
      
      // D'abord supprimer les articles liés
      const { error: articlesError } = await supabase
        .from('articles_bon_livraison')
        .delete()
        .eq('bon_livraison_id', bonLivraisonId);

      if (articlesError) {
        console.error('❌ Erreur lors de la suppression des articles:', articlesError);
        throw new Error(`Erreur de suppression des articles: ${articlesError.message}`);
      }

      // Ensuite supprimer le bon de livraison
      const { error: bonError } = await supabase
        .from('bons_de_livraison')
        .delete()
        .eq('id', bonLivraisonId);

      if (bonError) {
        console.error('❌ Erreur lors de la suppression du bon:', bonError);
        throw new Error(`Erreur de suppression du bon: ${bonError.message}`);
      }

      console.log('✅ Bon de livraison supprimé avec succès');
      return bonLivraisonId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-livraison-articles-counts'] });
      toast({
        title: "✅ Bon de livraison supprimé",
        description: "Le bon de livraison a été supprimé avec succès.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la suppression:', error);
      toast({
        title: "❌ Erreur de suppression",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression du bon de livraison.",
        variant: "destructive",
      });
    }
  });

  return { deleteBonLivraison };
};
