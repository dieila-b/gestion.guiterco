import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useGenererBonLivraison = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (precommandeId: string) => {
      const { data, error } = await supabase.rpc('generer_bon_livraison_precommande', {
        precommande_uuid: precommandeId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-precommandes'] });
      toast({
        title: "Bon de livraison généré",
        description: "Le bon de livraison a été créé avec succès pour cette précommande.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la génération du bon de livraison:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le bon de livraison",
        variant: "destructive",
      });
    }
  });
};

export const useMarquerNotificationVue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications_precommandes')
        .update({ 
          statut: 'vue',
          date_envoi: new Date().toISOString()
        })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-precommandes'] });
    }
  });
};

export const useCreatePrecommande = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (precommande: {
      numero_precommande: string;
      client_id: string;
      date_precommande: string;
      date_livraison_prevue?: string;
      observations?: string;
      acompte_verse?: number;
      lignes: Array<{
        article_id: string;
        quantite: number;
        prix_unitaire: number;
      }>;
    }) => {
      const { lignes, ...precommandeData } = precommande;
      
      // Calculer les montants avec TVA par défaut à 0%
      const montant_ht = lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);
      const taux_tva = 0; // TVA par défaut à 0%
      const tva = montant_ht * (taux_tva / 100);
      const montant_ttc = montant_ht + tva;
      const reste_a_payer = montant_ttc - (precommandeData.acompte_verse || 0);

      // Créer la précommande
      const { data: newPrecommande, error: precommandeError } = await supabase
        .from('precommandes')
        .insert({
          ...precommandeData,
          montant_ht,
          tva,
          montant_ttc,
          taux_tva,
          reste_a_payer,
          statut: 'confirmee'
        })
        .select()
        .single();

      if (precommandeError) throw precommandeError;

      // Créer les lignes de précommande
      const lignesWithPrecommandeId = lignes.map(ligne => ({
        ...ligne,
        precommande_id: newPrecommande.id,
        montant_ligne: ligne.quantite * ligne.prix_unitaire
      }));

      const { error: lignesError } = await supabase
        .from('lignes_precommande')
        .insert(lignesWithPrecommandeId);

      if (lignesError) throw lignesError;

      return newPrecommande;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.refetchQueries({ queryKey: ['precommandes-complete'] });
      toast({
        title: "Précommande créée",
        description: "La précommande a été créée avec succès.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la création de la précommande:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la précommande",
        variant: "destructive",
      });
    }
  });
};
