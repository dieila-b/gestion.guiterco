
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBonsCommande } from '@/hooks/useBonsCommande';

export const useBonCommandeDelete = () => {
  const { deleteBonCommande } = useBonsCommande();

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

  return { handleDelete };
};
