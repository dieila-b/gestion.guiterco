
import { useQuery } from '@tanstack/react-query';
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

// Hook pour les clients
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    }
  });
};

// Hook pour les commandes clients (vente au comptoir)
export const useCommandesClients = () => {
  return useQuery({
    queryKey: ['commandes_clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commandes_clients')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CommandeClient[];
    }
  });
};

// Hook pour les factures de vente
export const useFacturesVente = () => {
  return useQuery({
    queryKey: ['factures_vente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('factures_vente')
        .select(`
          *,
          client:clients(*),
          commande:commandes_clients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FactureVente[];
    }
  });
};

// Hook pour les précommandes
export const usePrecommandes = () => {
  return useQuery({
    queryKey: ['precommandes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('precommandes')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Precommande[];
    }
  });
};

// Hook pour les factures de précommandes
export const useFacturesPrecommandes = () => {
  return useQuery({
    queryKey: ['factures_precommandes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('factures_precommandes')
        .select(`
          *,
          client:clients(*),
          precommande:precommandes(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FacturePrecommande[];
    }
  });
};

// Hook pour les versements clients
export const useVersementsClients = () => {
  return useQuery({
    queryKey: ['versements_clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('versements_clients')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VersementClient[];
    }
  });
};

// Hook pour les devis
export const useDevisVente = () => {
  return useQuery({
    queryKey: ['devis_vente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devis_vente')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DevisVente[];
    }
  });
};

// Hook pour les retours clients
export const useRetoursClients = () => {
  return useQuery({
    queryKey: ['retours_clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retours_clients')
        .select(`
          *,
          client:clients(*),
          facture:factures_vente(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RetourClient[];
    }
  });
};
