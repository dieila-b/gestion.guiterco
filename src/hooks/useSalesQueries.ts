
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

// Hook pour les factures de vente avec relations complètes et nombre d'articles
export const useFacturesVente = () => {
  return useQuery({
    queryKey: ['factures_vente'],
    queryFn: async () => {
      console.log('Fetching factures vente with enhanced relations...');
      
      const { data, error } = await supabase
        .from('factures_vente')
        .select(`
          *,
          client:clients!inner(
            id,
            nom,
            nom_entreprise,
            email,
            telephone,
            type_client,
            statut_client,
            created_at,
            updated_at
          ),
          commande:commandes_clients(
            id,
            numero_commande,
            date_commande,
            statut,
            montant_ht,
            montant_ttc,
            tva,
            taux_tva,
            mode_paiement,
            observations,
            created_at,
            updated_at
          ),
          lignes_facture:lignes_facture_vente(
            id,
            quantite,
            prix_unitaire,
            montant_ligne,
            created_at,
            facture_vente_id,
            article_id,
            article:catalogue(
              id,
              nom,
              reference
            )
          ),
          versements:versements_clients!facture_id(
            id,
            numero_versement,
            montant,
            date_versement,
            mode_paiement,
            reference_paiement,
            observations,
            created_at,
            updated_at,
            client_id,
            facture_id
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching factures vente:', error);
        throw error;
      }
      
      console.log('Fetched factures vente with relations:', data);
      return data as FactureVente[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchInterval: 60000 // Synchronisation temps réel
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
