
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { FactureAchat } from '@/types/purchases';

export const useFacturesAchat = () => {
  const queryClient = useQueryClient();
  
  const { data: facturesAchat, isLoading, error } = useQuery({
    queryKey: ['factures-achat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('factures_achat')
        .select(`
          *,
          bon_commande:bon_commande_id(*),
          bon_livraison:bon_livraison_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FactureAchat[];
    }
  });

  const createFactureAchat = useMutation({
    mutationFn: async (newFacture: Omit<FactureAchat, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('factures_achat')
        .insert(newFacture)
        .select()
        .single();
      
      if (error) throw error;
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

  return {
    facturesAchat,
    isLoading,
    error,
    createFactureAchat
  };
};
