
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  Client,
  CommandeClient,
  FactureVente,
  Precommande,
  FacturePrecommande,
  VersementClient,
  DevisVente,
  RetourClient
} from '@/types/sales';

// Configuration optimisée pour les requêtes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// Hook optimisé pour les clients avec pagination
export const useClientsOptimized = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['clients', page, limit],
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data as Client[], count };
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
};

// Hook optimisé pour les commandes récentes seulement
export const useCommandesClientsRecent = (limit = 10) => {
  return useQuery({
    queryKey: ['commandes_clients_recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commandes_clients')
        .select(`
          id,
          numero_commande,
          statut,
          montant_ttc,
          date_commande,
          client:clients!inner(id, nom, prenom)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as CommandeClient[];
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false
  });
};

// Hook avec recherche optimisée et debounce
export const useCommandesSearch = (searchTerm: string, enabled = false) => {
  return useQuery({
    queryKey: ['commandes_search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 3) return [];
      
      const { data, error } = await supabase
        .from('commandes_clients')
        .select(`
          id,
          numero_commande,
          statut,
          montant_ttc,
          date_commande,
          client:clients!inner(nom, prenom)
        `)
        .or(`numero_commande.ilike.%${searchTerm}%,client.nom.ilike.%${searchTerm}%`)
        .limit(20);
      
      if (error) throw error;
      return data as CommandeClient[];
    },
    enabled: enabled && searchTerm.length >= 3,
    staleTime: 2 * 60 * 1000, // 2 minutes pour les recherches
    refetchOnWindowFocus: false
  });
};

// Préchargement intelligent des données
export const usePrefetchSalesData = () => {
  const queryClient = useQueryClient();
  
  const prefetchClients = () => {
    queryClient.prefetchQuery({
      queryKey: ['clients', 1, 50],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('clients')
          .select('id, nom, prenom, email, telephone')
          .limit(50);
        if (error) throw error;
        return data;
      },
      staleTime: STALE_TIME
    });
  };

  return { prefetchClients };
};
