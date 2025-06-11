
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Mutations pour créer/modifier des données
export const useCreateCommande = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commande: Partial<CommandeClient>) => {
      const { data, error } = await supabase
        .from('commandes_clients')
        .insert(commande)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes_clients'] });
    }
  });
};

export const useCreateFacture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (facture: Partial<FactureVente>) => {
      const { data, error } = await supabase
        .from('factures_vente')
        .insert(facture)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
    }
  });
};

export const useConvertDevisToCommande = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (devisId: string) => {
      // Récupérer le devis avec ses lignes
      const { data: devis, error: devisError } = await supabase
        .from('devis_vente')
        .select(`
          *,
          lignes_devis(*)
        `)
        .eq('id', devisId)
        .single();
      
      if (devisError) throw devisError;
      
      // Créer une nouvelle commande
      const numeroCommande = `CMD-${Date.now()}`;
      const { data: commande, error: commandeError } = await supabase
        .from('commandes_clients')
        .insert({
          numero_commande: numeroCommande,
          client_id: devis.client_id,
          montant_ht: devis.montant_ht,
          tva: devis.tva,
          montant_ttc: devis.montant_ttc,
          statut: 'confirmee'
        })
        .select()
        .single();
      
      if (commandeError) throw commandeError;
      
      // Marquer le devis comme accepté
      await supabase
        .from('devis_vente')
        .update({ statut: 'accepte' })
        .eq('id', devisId);
      
      return commande;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devis_vente'] });
      queryClient.invalidateQueries({ queryKey: ['commandes_clients'] });
    }
  });
};
