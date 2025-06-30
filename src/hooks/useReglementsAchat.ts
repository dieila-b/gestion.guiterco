
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ReglementAchat {
  id: string;
  facture_achat_id: string;
  montant: number;
  mode_paiement: string;
  date_reglement: string;
  reference_paiement?: string;
  observations?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useReglementsAchat = (factureId?: string) => {
  const queryClient = useQueryClient();

  const { data: reglements, isLoading } = useQuery({
    queryKey: ['reglements-achat', factureId],
    queryFn: async () => {
      if (!factureId) return [];
      
      console.log('Fetching reglements for facture:', factureId);
      const { data, error } = await supabase
        .from('reglements_achat')
        .select('*')
        .eq('facture_achat_id', factureId)
        .order('date_reglement', { ascending: false });
      
      if (error) {
        console.error('Error fetching reglements:', error);
        throw error;
      }
      
      console.log('Fetched reglements:', data);
      return data as ReglementAchat[];
    },
    enabled: !!factureId
  });

  const createReglement = useMutation({
    mutationFn: async (newReglement: Omit<ReglementAchat, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating reglement:', newReglement);
      const { data, error } = await supabase
        .from('reglements_achat')
        .insert(newReglement)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating reglement:', error);
        throw error;
      }
      
      console.log('Reglement created:', data);
      return data as ReglementAchat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reglements-achat'] });
      queryClient.invalidateQueries({ queryKey: ['factures-achat'] });
      toast({
        title: "Règlement enregistré",
        description: "Le règlement a été enregistré avec succès.",
      });
    }
  });

  return {
    reglements,
    isLoading,
    createReglement
  };
};

export const useAllReglementsAchat = () => {
  return useQuery({
    queryKey: ['all-reglements-achat'],
    queryFn: async () => {
      console.log('Fetching all reglements achat...');
      const { data, error } = await supabase
        .from('reglements_achat')
        .select('facture_achat_id, montant');
      
      if (error) {
        console.error('Error fetching all reglements:', error);
        throw error;
      }
      
      // Grouper les règlements par facture
      const reglementsParFacture: Record<string, number> = {};
      data?.forEach(reglement => {
        const factureId = reglement.facture_achat_id;
        if (factureId) {
          reglementsParFacture[factureId] = (reglementsParFacture[factureId] || 0) + reglement.montant;
        }
      });
      
      console.log('Reglements totaux par facture:', reglementsParFacture);
      return reglementsParFacture;
    }
  });
};
