
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaiementVente {
  id: string;
  facture_vente_id: string;
  montant: number;
  moyen_paiement?: string;
  date_paiement?: string;
  created_at?: string;
}

export interface CreatePaiementVente {
  facture_vente_id: string;
  montant: number;
  moyen_paiement?: string;
  date_paiement?: string;
}

export const usePaiementsVente = (factureId?: string) => {
  return useQuery({
    queryKey: ['paiements-vente', factureId],
    queryFn: async () => {
      let query = supabase
        .from('paiements_vente')
        .select('*')
        .order('date_paiement', { ascending: false });

      if (factureId) {
        query = query.eq('facture_vente_id', factureId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PaiementVente[];
    },
    enabled: !!factureId || factureId === undefined
  });
};

export const useCreatePaiementVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paiementData: CreatePaiementVente) => {
      const { data, error } = await supabase
        .from('paiements_vente')
        .insert(paiementData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paiements-vente'] });
      toast.success('Paiement enregistré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'enregistrement du paiement');
    }
  });
};
