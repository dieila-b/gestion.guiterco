
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientStatistique {
  client_id: string;
  client_nom: string;
  client_email: string;
  client_telephone: string;
  nombre_ventes: number;
  total_facture: number;
  total_paye: number;
  reste_a_payer: number;
}

export interface ClientEndette {
  client_id: string;
  client_nom: string;
  client_email: string;
  client_telephone: string;
  facture_id: string;
  numero_facture: string;
  date_facture: string;
  montant_total: number;
  montant_paye: number;
  reste_a_payer: number;
  statut_paiement: string;
}

export const useClientStatistics = () => {
  return useQuery({
    queryKey: ['client_statistics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_client_statistics');
      if (error) throw error;
      return data as ClientStatistique[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};

export const useClientsEndettes = () => {
  return useQuery({
    queryKey: ['clients_endettes'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_clients_endettes');
      if (error) throw error;
      return data as ClientEndette[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};
