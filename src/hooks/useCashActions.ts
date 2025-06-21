
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClôtureCaisse {
  id: string;
  cash_register_id: string;
  date_cloture: string;
  heure_cloture: string;
  solde_debut: number;
  solde_fin: number;
  total_entrees: number;
  total_sorties: number;
  balance_jour: number;
  nb_transactions: number;
  utilisateur_cloture?: string;
  observations?: string;
}

export interface ComptageDetails {
  billet_500: number;
  billet_200: number;
  billet_100: number;
  billet_50: number;
  billet_20: number;
  billet_10: number;
  billet_5: number;
  piece_2: number;
  piece_1: number;
  piece_050: number;
  piece_020: number;
  piece_010: number;
  piece_005: number;
  piece_002: number;
  piece_001: number;
}

export interface ComptageRequest {
  cash_register_id: string;
  montant_theorique: number;
  montant_reel: number;
  details_coupures?: ComptageDetails;
  observations?: string;
}

// Hook pour fermer la caisse
export const useCloseCashRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cashRegisterId: string) => {
      console.log('🔒 Fermeture de la caisse:', cashRegisterId);
      
      // Récupérer le solde actuel et les transactions du jour
      const { data: balanceData } = await supabase
        .from('cash_registers')
        .select('balance')
        .eq('id', cashRegisterId)
        .single();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Récupérer les transactions du jour
      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('cash_register_id', cashRegisterId)
        .gte('date_operation', today.toISOString())
        .lt('date_operation', tomorrow.toISOString());

      // Calculer les totaux
      const totalEntrees = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalSorties = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const balanceJour = totalEntrees - totalSorties;
      const nbTransactions = transactions?.length || 0;

      // Créer la clôture
      const { data: cloture, error } = await supabase
        .from('clotures_caisse')
        .insert({
          cash_register_id: cashRegisterId,
          solde_debut: (balanceData?.balance || 0) - balanceJour,
          solde_fin: balanceData?.balance || 0,
          total_entrees: totalEntrees,
          total_sorties: totalSorties,
          balance_jour: balanceJour,
          nb_transactions: nbTransactions,
          utilisateur_cloture: 'Utilisateur actuel'
        })
        .select()
        .single();

      if (error) throw error;

      // Marquer la caisse comme fermée
      await supabase
        .from('cash_registers')
        .update({ status: 'closed' })
        .eq('id', cashRegisterId);

      return cloture;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['clotures-caisse'] });
      toast.success('Caisse fermée avec succès');
    },
    onError: (error) => {
      console.error('Erreur fermeture caisse:', error);
      toast.error('Erreur lors de la fermeture de la caisse');
    }
  });
};

// Hook pour effectuer un comptage
export const useCreateComptage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (comptageData: ComptageRequest) => {
      console.log('🔢 Création comptage:', comptageData);
      
      const { data, error } = await supabase
        .from('comptages_caisse')
        .insert({
          cash_register_id: comptageData.cash_register_id,
          montant_theorique: comptageData.montant_theorique,
          montant_reel: comptageData.montant_reel,
          details_coupures: comptageData.details_coupures,
          observations: comptageData.observations,
          utilisateur_comptage: 'Utilisateur actuel'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comptages-caisse'] });
      toast.success('Comptage enregistré avec succès');
    },
    onError: (error) => {
      console.error('Erreur comptage:', error);
      toast.error('Erreur lors du comptage');
    }
  });
};

// Hook pour générer un état de caisse
export const useGenerateEtatCaisse = () => {
  return useMutation({
    mutationFn: async ({ cashRegisterId, type }: { cashRegisterId: string; type: 'quotidien' | 'fermeture' | 'comptage' }) => {
      console.log('📋 Génération état de caisse:', { cashRegisterId, type });
      
      // Récupérer les données nécessaires
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('cash_register_id', cashRegisterId)
        .gte('date_operation', today.toISOString())
        .lt('date_operation', tomorrow.toISOString())
        .order('date_operation', { ascending: false });

      const { data: cashRegister } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('id', cashRegisterId)
        .single();

      // Calculer les totaux
      const totalEntrees = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalSorties = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const donneesEtat = {
        caisse: cashRegister,
        transactions: transactions || [],
        totaux: {
          entrees: totalEntrees,
          sorties: totalSorties,
          balance: totalEntrees - totalSorties,
          solde_actuel: cashRegister?.balance || 0
        },
        periode: {
          debut: today.toISOString(),
          fin: new Date().toISOString()
        }
      };

      // Enregistrer l'état
      const { data, error } = await supabase
        .from('etats_caisse')
        .insert({
          cash_register_id: cashRegisterId,
          type_etat: type,
          donnees_etat: donneesEtat,
          utilisateur_generation: 'Utilisateur actuel'
        })
        .select()
        .single();

      if (error) throw error;
      return { etat: data, donnees: donneesEtat };
    },
    onSuccess: () => {
      toast.success('État de caisse généré avec succès');
    },
    onError: (error) => {
      console.error('Erreur génération état:', error);
      toast.error('Erreur lors de la génération de l\'état');
    }
  });
};

// Hook pour récupérer les clôtures
export const useClotures = (cashRegisterId?: string) => {
  return useQuery({
    queryKey: ['clotures-caisse', cashRegisterId],
    queryFn: async () => {
      let query = supabase
        .from('clotures_caisse')
        .select('*')
        .order('date_cloture', { ascending: false });
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ClôtureCaisse[];
    }
  });
};

// Hook pour récupérer les comptages
export const useComptages = (cashRegisterId?: string) => {
  return useQuery({
    queryKey: ['comptages-caisse', cashRegisterId],
    queryFn: async () => {
      let query = supabase
        .from('comptages_caisse')
        .select('*')
        .order('date_comptage', { ascending: false });
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};
