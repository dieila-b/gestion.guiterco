
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LignePrecommandeUpdate {
  id?: string;
  article_id: string;
  quantite: number;
  quantite_livree: number;
  prix_unitaire: number;
  statut_ligne: string;
  montant_ligne: number;
}

export const useUpdateLignesPrecommande = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      precommande_id, 
      lignes 
    }: { 
      precommande_id: string; 
      lignes: LignePrecommandeUpdate[];
    }) => {
      // Récupérer les lignes existantes
      const { data: existingLignes } = await supabase
        .from('lignes_precommande')
        .select('id')
        .eq('precommande_id', precommande_id);

      const existingIds = existingLignes?.map(l => l.id) || [];
      const updatedIds = lignes.filter(l => l.id).map(l => l.id);

      // Supprimer les lignes qui ne sont plus dans la liste
      const idsToDelete = existingIds.filter(id => !updatedIds.includes(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('lignes_precommande')
          .delete()
          .in('id', idsToDelete);
        
        if (deleteError) throw deleteError;
      }

      // Traiter chaque ligne
      for (const ligne of lignes) {
        if (ligne.id) {
          // Mettre à jour la ligne existante
          const { error: updateError } = await supabase
            .from('lignes_precommande')
            .update({
              quantite: ligne.quantite,
              quantite_livree: ligne.quantite_livree,
              prix_unitaire: ligne.prix_unitaire,
              statut_ligne: ligne.statut_ligne,
              montant_ligne: ligne.montant_ligne,
              updated_at: new Date().toISOString()
            })
            .eq('id', ligne.id);

          if (updateError) throw updateError;
        } else {
          // Créer une nouvelle ligne
          const { error: insertError } = await supabase
            .from('lignes_precommande')
            .insert({
              precommande_id,
              article_id: ligne.article_id,
              quantite: ligne.quantite,
              quantite_livree: ligne.quantite_livree,
              prix_unitaire: ligne.prix_unitaire,
              statut_ligne: ligne.statut_ligne,
              montant_ligne: ligne.montant_ligne
            });

          if (insertError) throw insertError;
        }
      }

      // Recalculer les totaux de la précommande
      const totalHT = lignes.reduce((sum, ligne) => sum + ligne.montant_ligne, 0);
      const tva = totalHT * 0.20;
      const totalTTC = totalHT + tva;

      const { error: updatePrecommandeError } = await supabase
        .from('precommandes')
        .update({
          montant_ht: totalHT,
          tva: tva,
          montant_ttc: totalTTC,
          updated_at: new Date().toISOString()
        })
        .eq('id', precommande_id);

      if (updatePrecommandeError) throw updatePrecommandeError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['precommandes-pretes'] });
      toast({
        title: "Articles mis à jour",
        description: "Les articles de la précommande ont été modifiés avec succès.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour des articles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les articles de la précommande",
        variant: "destructive",
      });
    }
  });
};
