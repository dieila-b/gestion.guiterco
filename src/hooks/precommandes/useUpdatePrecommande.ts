
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { LignePrecommandeComplete } from '@/types/precommandes';

export const useUpdatePrecommande = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates, 
      lignes_precommande 
    }: { 
      id: string; 
      updates: any; 
      lignes_precommande?: LignePrecommandeComplete[] 
    }) => {
      console.log('🔄 Mise à jour précommande:', { id, updates, lignes_precommande });

      // Mettre à jour la précommande principale avec le statut_livraison
      const { data: precommande, error: precommandeError } = await supabase
        .from('precommandes')
        .update({
          observations: updates.observations,
          date_livraison_prevue: updates.date_livraison_prevue,
          montant_ht: updates.montant_ht,
          tva: updates.tva,
          montant_ttc: updates.montant_ttc,
          acompte_verse: updates.acompte_verse,
          reste_a_payer: updates.reste_a_payer,
          statut: updates.statut,
          // IMPORTANT: Mettre à jour aussi le statut_livraison
          statut_livraison: updates.statut_livraison || 'en_attente',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (precommandeError) {
        console.error('❌ Erreur mise à jour précommande:', precommandeError);
        throw precommandeError;
      }

      console.log('✅ Précommande mise à jour:', precommande);

      // Mettre à jour les lignes si elles sont fournies
      if (lignes_precommande && lignes_precommande.length > 0) {
        console.log('🔄 Mise à jour des lignes précommande...');

        for (const ligne of lignes_precommande) {
          if (ligne.id && !ligne.id.startsWith('temp-')) {
            // Ligne existante - mise à jour
            const { error: ligneError } = await supabase
              .from('lignes_precommande')
              .update({
                quantite: ligne.quantite,
                prix_unitaire: ligne.prix_unitaire,
                montant_ligne: ligne.montant_ligne,
                quantite_livree: ligne.quantite_livree || 0,
                statut_ligne: ligne.statut_ligne || 'en_attente',
                updated_at: new Date().toISOString()
              })
              .eq('id', ligne.id);

            if (ligneError) {
              console.error('❌ Erreur mise à jour ligne:', ligneError);
              throw ligneError;
            }
          } else {
            // Nouvelle ligne - insertion
            const { error: ligneError } = await supabase
              .from('lignes_precommande')
              .insert({
                precommande_id: id,
                article_id: ligne.article_id,
                quantite: ligne.quantite,
                prix_unitaire: ligne.prix_unitaire,
                montant_ligne: ligne.montant_ligne,
                quantite_livree: ligne.quantite_livree || 0,
                statut_ligne: ligne.statut_ligne || 'en_attente'
              });

            if (ligneError) {
              console.error('❌ Erreur insertion ligne:', ligneError);
              throw ligneError;
            }
          }
        }

        console.log('✅ Lignes précommande mises à jour');
      }

      return precommande;
    },
    onSuccess: (data) => {
      console.log('✅ Précommande sauvegardée avec succès:', data);
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.refetchQueries({ queryKey: ['precommandes-complete'] });
      
      toast({
        title: "Précommande mise à jour",
        description: "Les modifications ont été sauvegardées avec succès.",
      });
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder la précommande: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};

export const useDeletePrecommande = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (precommandeId: string) => {
      console.log('🗑️ Suppression précommande:', precommandeId);

      // Supprimer les lignes de précommande en premier
      const { error: lignesError } = await supabase
        .from('lignes_precommande')
        .delete()
        .eq('precommande_id', precommandeId);

      if (lignesError) {
        console.error('❌ Erreur suppression lignes précommande:', lignesError);
        throw lignesError;
      }

      // Supprimer les notifications liées
      const { error: notificationsError } = await supabase
        .from('notifications_precommandes')
        .delete()
        .eq('precommande_id', precommandeId);

      if (notificationsError) {
        console.error('❌ Erreur suppression notifications:', notificationsError);
        // Ne pas bloquer pour les notifications, juste logger
      }

      // Supprimer la précommande
      const { error: precommandeError } = await supabase
        .from('precommandes')
        .delete()
        .eq('id', precommandeId);

      if (precommandeError) {
        console.error('❌ Erreur suppression précommande:', precommandeError);
        throw precommandeError;
      }

      console.log('✅ Précommande supprimée avec succès');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.refetchQueries({ queryKey: ['precommandes-complete'] });
      
      toast({
        title: "Précommande supprimée",
        description: "La précommande a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la précommande: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};
