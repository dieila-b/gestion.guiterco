import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUpdatePrecommande = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates,
      lignes_precommande 
    }: { 
      id: string; 
      updates: {
        observations?: string;
        acompte_verse?: number;
        date_livraison_prevue?: string;
        montant_ht?: number;
        tva?: number;
        montant_ttc?: number;
        reste_a_payer?: number;
        statut?: string;
        taux_tva?: number;
        statut_livraison?: string;
        statut_paiement?: string;
      };
      lignes_precommande?: any[];
    }) => {
      console.log('🔄 Mise à jour précommande:', { id, updates, lignes_precommande });
      
      // Assurer la cohérence des montants sans TVA
      const updatedData = {
        ...updates,
        tva: 0,
        taux_tva: 0,
        montant_ht: updates.montant_ttc || updates.montant_ht || 0,
        updated_at: new Date().toISOString()
      };

      // Mettre à jour la précommande
      const { data: precommandeData, error: precommandeError } = await supabase
        .from('precommandes')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

      if (precommandeError) {
        console.error('❌ Erreur mise à jour précommande:', precommandeError);
        throw precommandeError;
      }

      // Mettre à jour les lignes de précommande si fournies
      if (lignes_precommande && lignes_precommande.length > 0) {
        for (const ligne of lignes_precommande) {
          if (ligne.id && !ligne.id.startsWith('temp-')) {
            // Mise à jour d'une ligne existante
            const { error: ligneError } = await supabase
              .from('lignes_precommande')
              .update({
                quantite: ligne.quantite,
                quantite_livree: ligne.quantite_livree || 0,
                prix_unitaire: ligne.prix_unitaire,
                montant_ligne: ligne.montant_ligne,
                statut_ligne: ligne.quantite_livree >= ligne.quantite ? 'livree' : 
                             ligne.quantite_livree > 0 ? 'partiellement_livree' : 'en_attente',
                updated_at: new Date().toISOString()
              })
              .eq('id', ligne.id);

            if (ligneError) {
              console.error('❌ Erreur mise à jour ligne:', ligneError);
              throw ligneError;
            }
          }
        }

        // Recalculer le statut de livraison global
        const totalQuantite = lignes_precommande.reduce((sum, ligne) => sum + ligne.quantite, 0);
        const totalLivree = lignes_precommande.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);
        
        let statutLivraison = 'en_preparation';
        if (totalLivree === totalQuantite && totalQuantite > 0) {
          statutLivraison = 'livree';
        } else if (totalLivree > 0) {
          statutLivraison = 'partiellement_livree';
        }

        // Mettre à jour le statut de la précommande
        const { error: statutError } = await supabase
          .from('precommandes')
          .update({ 
            statut: statutLivraison,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (statutError) {
          console.error('❌ Erreur mise à jour statut:', statutError);
        }
      }
      
      console.log('✅ Précommande mise à jour:', precommandeData);
      return precommandeData;
    },
    onSuccess: () => {
      // Invalider et rafraîchir toutes les queries liées aux précommandes
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['precommandes'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-precommandes'] });
      queryClient.invalidateQueries({ queryKey: ['factures_precommandes'] });
      queryClient.invalidateQueries({ queryKey: ['stock-disponibilite-multiple'] });
      
      // Forcer un rafraîchissement immédiat de toutes les données
      queryClient.refetchQueries({ queryKey: ['precommandes-complete'] });
      queryClient.refetchQueries({ queryKey: ['precommandes'] });
      
      toast({
        title: "Précommande modifiée",
        description: "Les modifications ont été enregistrées et le stock a été mis à jour automatiquement.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la précommande",
        variant: "destructive",
      });
    }
  });
};

export const useDeletePrecommande = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // D'abord supprimer les lignes de précommande
      const { error: lignesError } = await supabase
        .from('lignes_precommande')
        .delete()
        .eq('precommande_id', id);

      if (lignesError) throw lignesError;

      // Ensuite supprimer la précommande
      const { error } = await supabase
        .from('precommandes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['precommandes'] });
      queryClient.refetchQueries({ queryKey: ['precommandes-complete'] });
      
      toast({
        title: "Précommande supprimée",
        description: "La précommande a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la précommande",
        variant: "destructive",
      });
    }
  });
};
