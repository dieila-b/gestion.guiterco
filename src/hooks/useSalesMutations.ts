
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CreateCommandeInput, CreateFactureInput } from '@/types/sales-mutations';

// Mutations pour créer/modifier des données
export const useCreateCommande = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commande: CreateCommandeInput) => {
      const { data, error } = await supabase
        .from('commandes_clients')
        .insert(commande)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes_clients'] });
    }
  });
};

export const useCreateFacture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (facture: CreateFactureInput) => {
      const { data, error } = await supabase
        .from('factures_vente')
        .insert({
          ...facture,
          numero_facture: facture.numero_facture || ''
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
    }
  });
};

export const useConvertDevisToCommande = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (devisId: string) => {
      console.log('🔄 Conversion devis vers commande:', devisId);
      
      try {
        // Récupérer le devis avec ses détails
        const { data: devis, error: devisError } = await supabase
          .from('devis_vente')
          .select(`
            *,
            lignes_devis(*)
          `)
          .eq('id', devisId)
          .single();
        
        if (devisError) {
          console.error('❌ Erreur récupération devis:', devisError);
          throw devisError;
        }
        
        if (!devis) {
          throw new Error('Devis introuvable');
        }
        
        // Créer une nouvelle commande
        const numeroCommande = `CMD-${Date.now()}`;
        const { data: commande, error: commandeError } = await supabase
          .from('commandes_clients')
          .insert({
            numero_commande: numeroCommande,
            client_id: devis.client_id,
            montant_ht: devis.montant_ht,
            tva: devis.tva,
            montant_ttc: devis.montant_ttc,
            statut: 'confirmee'
          })
          .select()
          .single();
        
        if (commandeError) {
          console.error('❌ Erreur création commande:', commandeError);
          throw commandeError;
        }
        
        // Marquer le devis comme accepté
        const { error: updateError } = await supabase
          .from('devis_vente')
          .update({ statut: 'accepte' })
          .eq('id', devisId);
        
        if (updateError) {
          console.error('❌ Erreur mise à jour devis:', updateError);
          throw updateError;
        }
        
        console.log('✅ Devis converti en commande:', commande);
        return commande;
      } catch (error) {
        console.error('❌ Erreur dans useConvertDevisToCommande:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devis_vente'] });
      queryClient.invalidateQueries({ queryKey: ['commandes_clients'] });
    }
  });
};
