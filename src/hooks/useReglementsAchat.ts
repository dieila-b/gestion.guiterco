
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ReglementAchat {
  id: string;
  facture_achat_id: string;
  montant: number;
  date_reglement: string;
  mode_paiement: string;
  reference_paiement?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useReglementsAchat = (factureId?: string) => {
  return useQuery({
    queryKey: ['reglements-achat', factureId],
    queryFn: async () => {
      if (!factureId) return [];
      
      console.log('Fetching règlements for facture achat:', factureId);
      const { data, error } = await supabase
        .from('reglements_achat')
        .select('*')
        .eq('facture_achat_id', factureId)
        .order('date_reglement', { ascending: false });
      
      if (error) {
        console.error('Error fetching règlements achat:', error);
        throw error;
      }
      
      return data as ReglementAchat[];
    },
    enabled: !!factureId
  });
};

export const useAllReglementsAchat = () => {
  const queryClient = useQueryClient();
  
  const { data: reglements, isLoading } = useQuery({
    queryKey: ['all-reglements-achat'],
    queryFn: async () => {
      console.log('Fetching all règlements achat...');
      const { data, error } = await supabase
        .from('reglements_achat')
        .select('facture_achat_id, montant');
      
      if (error) {
        console.error('Error fetching all règlements achat:', error);
        throw error;
      }
      
      // Group by facture_achat_id and sum amounts
      const reglementsMap: Record<string, number> = {};
      data?.forEach(reglement => {
        const factureId = reglement.facture_achat_id;
        if (factureId) {
          reglementsMap[factureId] = (reglementsMap[factureId] || 0) + (reglement.montant || 0);
        }
      });
      
      return reglementsMap;
    }
  });

  const createReglement = useMutation({
    mutationFn: async (newReglement: Omit<ReglementAchat, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating règlement achat:', newReglement);
      const { data, error } = await supabase
        .from('reglements_achat')
        .insert(newReglement)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating règlement achat:', error);
        throw error;
      }
      
      return data as ReglementAchat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reglements-achat'] });
      queryClient.invalidateQueries({ queryKey: ['all-reglements-achat'] });
      queryClient.invalidateQueries({ queryKey: ['factures-achat'] });
      toast({
        title: "Règlement d'achat enregistré",
        description: "Le règlement a été ajouté avec succès.",
      });
    }
  });

  return {
    reglements,
    isLoading,
    createReglement
  };
};
