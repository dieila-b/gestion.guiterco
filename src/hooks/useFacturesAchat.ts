
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { FactureAchat } from '@/types/purchases';

export const useFacturesAchat = () => {
  const queryClient = useQueryClient();
  
  const { data: facturesAchat, isLoading, error } = useQuery({
    queryKey: ['factures-achat'],
    queryFn: async () => {
      console.log('Fetching factures achat with enhanced relations...');
      const { data, error } = await supabase
        .from('factures_achat')
        .select(`
          *,
          bon_commande:bons_de_commande!factures_achat_bon_commande_id_fkey(*),
          bon_livraison:bons_de_livraison!factures_achat_bon_livraison_id_fkey(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching factures achat:', error);
        throw error;
      }
      
      console.log('Fetched factures achat:', data);
      return data as FactureAchat[];
    }
  });

  const createFactureAchat = useMutation({
    mutationFn: async (newFacture: Omit<FactureAchat, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating facture achat:', newFacture);
      const { data, error } = await supabase
        .from('factures_achat')
        .insert(newFacture)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating facture achat:', error);
        throw error;
      }
      
      console.log('Facture achat created:', data);
      return data as FactureAchat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures-achat'] });
      toast({
        title: "Facture d'achat créée avec succès",
        variant: "default",
      });
    }
  });

  const updateFactureAchat = useMutation({
    mutationFn: async ({ id, ...facture }: Partial<FactureAchat> & { id: string }) => {
      console.log('Updating facture achat:', id, facture);
      const { data, error } = await supabase
        .from('factures_achat')
        .update(facture)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating facture achat:', error);
        throw error;
      }
      
      console.log('Facture achat updated:', data);
      return data as FactureAchat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures-achat'] });
      toast({
        title: "Facture d'achat mise à jour avec succès",
        variant: "default",
      });
    }
  });

  const deleteFactureAchat = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting facture achat:', id);
      const { error } = await supabase
        .from('factures_achat')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting facture achat:', error);
        throw error;
      }
      
      console.log('Facture achat deleted:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures-achat'] });
      toast({
        title: "Facture d'achat supprimée avec succès",
        variant: "default",
      });
    }
  });

  return {
    facturesAchat,
    isLoading,
    error,
    createFactureAchat,
    updateFactureAchat,
    deleteFactureAchat
  };
};
