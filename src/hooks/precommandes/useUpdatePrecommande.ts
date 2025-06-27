import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { updateStockOnDelivery } from './services/stockUpdateService';

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

      // ÉTAPE 1: Mettre à jour les lignes de précommande AVANT la gestion du stock
      if (lignes_precommande && lignes_precommande.length > 0) {
        console.log('📦 Mise à jour des lignes de précommande...');
        
        for (const ligne of lignes_precommande) {
          if (ligne.id && !ligne.id.startsWith('temp-')) {
            const nouvelleQuantiteLivree = ligne.quantite_livree || 0;
            
            console.log(`🔍 Mise à jour ligne ${ligne.id}: quantité livrée = ${nouvelleQuantiteLivree}`);
            
            // Mise à jour de la ligne existante avec la nouvelle quantité livrée
            const { error: ligneError } = await supabase
              .from('lignes_precommande')
              .update({
                quantite: ligne.quantite,
                quantite_livree: nouvelleQuantiteLivree,
                prix_unitaire: ligne.prix_unitaire,
                montant_ligne: ligne.montant_ligne,
                statut_ligne: nouvelleQuantiteLivree >= ligne.quantite ? 'livree' : 
                             nouvelleQuantiteLivree > 0 ? 'partiellement_livree' : 'en_attente',
                updated_at: new Date().toISOString()
              })
              .eq('id', ligne.id);

            if (ligneError) {
              console.error('❌ Erreur mise à jour ligne:', ligneError);
              throw ligneError;
            }
            
            console.log(`✅ Ligne mise à jour: ${ligne.id}, Qté livrée: ${nouvelleQuantiteLivree}`);
          } else if (ligne.id && ligne.id.startsWith('temp-')) {
            // Nouvelle ligne à créer
            const { error: createError } = await supabase
              .from('lignes_precommande')
              .insert({
                precommande_id: id,
                article_id: ligne.article_id,
                quantite: ligne.quantite,
                quantite_livree: ligne.quantite_livree || 0,
                prix_unitaire: ligne.prix_unitaire,
                montant_ligne: ligne.montant_ligne,
                statut_ligne: (ligne.quantite_livree || 0) >= ligne.quantite ? 'livree' : 
                             (ligne.quantite_livree || 0) > 0 ? 'partiellement_livree' : 'en_attente'
              });

            if (createError) {
              console.error('❌ Erreur création nouvelle ligne:', createError);
              throw createError;
            }
          }
        }

        // ÉTAPE 2: Maintenant gérer le stock APRÈS avoir mis à jour les lignes
        console.log('🏭 Mise à jour du stock...');
        await updateStockOnDelivery(lignes_precommande, id);

        // ÉTAPE 3: Recalculer le statut de livraison global
        const totalQuantite = lignes_precommande.reduce((sum, ligne) => sum + ligne.quantite, 0);
        const totalLivree = lignes_precommande.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);
        
        let statutLivraison = 'en_preparation';
        if (totalLivree === totalQuantite && totalQuantite > 0) {
          statutLivraison = 'livree';
        } else if (totalLivree > 0) {
          statutLivraison = 'partiellement_livree';
        }

        console.log(`📊 Statut calculé: ${statutLivraison} (${totalLivree}/${totalQuantite})`);

        // Ajouter le statut de livraison aux données à mettre à jour
        updatedData.statut = statutLivraison;
      }

      // ÉTAPE 4: Mettre à jour la précommande
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
      
      console.log('✅ Précommande mise à jour:', precommandeData);
      return precommandeData;
    },
    onSuccess: () => {
      // Invalider et rafraîchir toutes les queries liées aux précommandes ET au stock
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['precommandes'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-precommandes'] });
      queryClient.invalidateQueries({ queryKey: ['factures_precommandes'] });
      queryClient.invalidateQueries({ queryKey: ['stock-disponibilite-multiple'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      
      // Forcer un rafraîchissement immédiat de toutes les données
      queryClient.refetchQueries({ queryKey: ['precommandes-complete'] });
      queryClient.refetchQueries({ queryKey: ['precommandes'] });
      queryClient.refetchQueries({ queryKey: ['stock-principal'] });
      queryClient.refetchQueries({ queryKey: ['stock-pdv'] });
      
      toast({
        title: "Précommande modifiée",
        description: "Les modifications ont été enregistrées et le stock a été mis à jour automatiquement (différence uniquement).",
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
