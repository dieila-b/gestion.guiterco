
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

export const useFacturesVenteQuery = () => {
  return useQuery({
    queryKey: ['factures-vente'],
    queryFn: async () => {
      console.log('🔄 Chargement des factures de vente...');
      
      try {
        const { data, error } = await supabase
          .from('factures_vente')
          .select(`
            *,
            client:client_id(
              id,
              nom,
              prenom,
              email,
              telephone,
              nom_entreprise
            ),
            lignes_facture:lignes_facture_vente(
              id,
              article_id,
              quantite,
              prix_unitaire_brut,
              remise_unitaire,
              montant_ligne,
              statut_livraison
            ),
            versements:versements_clients(
              id,
              montant,
              date_versement,
              mode_paiement
            )
          `)
          .order('date_facture', { ascending: false });
        
        if (error) {
          console.error('❌ Erreur lors du chargement des factures:', error);
          throw error;
        }
        
        const factures = (data || []).map((facture: any) => ({
          ...facture,
          nb_articles: facture.lignes_facture?.length || 0,
          lignes_facture: facture.lignes_facture || []
        }));
        
        console.log('✅ Factures de vente chargées:', factures.length);
        return factures as FactureVente[];
      } catch (error) {
        console.error('❌ Erreur dans useFacturesVenteQuery:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
  });
};

export const useVersementsClientsQuery = () => {
  return useQuery({
    queryKey: ['versements-clients'],
    queryFn: async () => {
      console.log('🔄 Chargement des versements clients...');
      
      try {
        const { data, error } = await supabase
          .from('versements_clients')
          .select(`
            *,
            client:client_id(nom, prenom, email)
          `)
          .order('date_versement', { ascending: false });
        
        if (error) {
          console.error('❌ Erreur lors du chargement des versements:', error);
          throw error;
        }
        
        console.log('✅ Versements clients chargés:', data?.length);
        return data || [];
      } catch (error) {
        console.error('❌ Erreur dans useVersementsClientsQuery:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};

export const useFacturesPrecommandesQuery = () => {
  return useQuery({
    queryKey: ['factures-precommandes'],
    queryFn: async () => {
      console.log('🔄 Chargement des factures de précommandes...');
      
      try {
        const { data, error } = await supabase
          .from('factures_precommandes')
          .select(`
            *,
            client:client_id(nom, prenom, email),
            precommande:precommande_id(numero_precommande)
          `)
          .order('date_facture', { ascending: false });
        
        if (error) {
          console.error('❌ Erreur lors du chargement des factures précommandes:', error);
          throw error;
        }
        
        console.log('✅ Factures précommandes chargées:', data?.length);
        return data || [];
      } catch (error) {
        console.error('❌ Erreur dans useFacturesPrecommandesQuery:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};

// Add missing devis hooks
export const useDevisVenteQuery = () => {
  return useQuery({
    queryKey: ['devis_vente'],
    queryFn: async () => {
      console.log('🔄 Chargement des devis de vente...');
      
      try {
        const { data, error } = await supabase
          .from('devis_vente')
          .select(`
            *,
            client:clients(*)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('❌ Erreur lors du chargement des devis:', error);
          throw error;
        }
        
        console.log('✅ Devis de vente chargés:', data?.length);
        return data || [];
      } catch (error) {
        console.error('❌ Erreur dans useDevisVenteQuery:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};

// Add missing retours clients hook
export const useRetoursClientsQuery = () => {
  return useQuery({
    queryKey: ['retours_clients'],
    queryFn: async () => {
      console.log('🔄 Chargement des retours clients...');
      
      try {
        const { data, error } = await supabase
          .from('retours_clients')
          .select(`
            *,
            client:clients(*),
            facture:factures_vente(numero_facture)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('❌ Erreur lors du chargement des retours:', error);
          throw error;
        }
        
        console.log('✅ Retours clients chargés:', data?.length);
        return data || [];
      } catch (error) {
        console.error('❌ Erreur dans useRetoursClientsQuery:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};
