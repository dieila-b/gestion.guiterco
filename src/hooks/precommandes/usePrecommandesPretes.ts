
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PrecommandePrete {
  id: string;
  numero_precommande: string;
  client_id: string;
  client_nom: string;
  client_email?: string;
  date_precommande: string;
  statut: string;
  montant_ht: number;
  montant_ttc: number;
  acompte_verse?: number;
  nb_lignes: number;
  nb_lignes_livrees: number;
  montant_total: number;
  prete_pour_conversion: boolean;
}

export const usePrecommandesPretes = () => {
  return useQuery({
    queryKey: ['precommandes-pretes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vue_precommandes_pretes')
        .select('*')
        .order('date_precommande', { ascending: true });
      
      if (error) throw error;
      return data as PrecommandePrete[];
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
};
