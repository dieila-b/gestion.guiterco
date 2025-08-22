
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

// Cache réduit à 5 minutes pour éviter les données obsolètes
const CACHE_TIME = 5 * 60 * 1000;

// Hook principal simplifié avec requêtes séparées
export const useUltraCache = () => {
  return {
    refreshAll: () => {
      // Fonction de rafraîchissement simple
    }
  };
};

// Fonction de chargement du catalogue - SIMPLIFIÉE
const fetchCatalogueData = async () => {
  try {
    console.log('📦 Chargement du catalogue...');
    
    const { data, error } = await supabase
      .from('catalogue')
      .select('*')
      .eq('statut', 'actif')
      .order('nom');
    
    if (error) {
      console.error('❌ Erreur catalogue:', error);
      throw error;
    }
    
    console.log('✅ Catalogue chargé:', data?.length || 0, 'articles');
    return data || [];
    
  } catch (error) {
    console.error('❌ Erreur catalogue:', error);
    return [];
  }
};

// Fonction de chargement du stock principal - SIMPLIFIÉE
const fetchStockPrincipalData = async () => {
  try {
    console.log('📊 Chargement du stock principal...');
    
    const { data, error } = await supabase
      .from('stock_principal')
      .select(`
        *,
        article:catalogue!stock_principal_article_id_fkey(id, nom, reference, prix_vente, prix_achat),
        entrepot:entrepots!stock_principal_entrepot_id_fkey(id, nom)
      `)
      .gt('quantite_disponible', 0)
      .limit(100); // Limiter pour éviter les requêtes trop lourdes
    
    if (error) {
      console.error('❌ Erreur stock principal:', error);
      throw error;
    }
    
    console.log('✅ Stock principal chargé:', data?.length || 0, 'entrées');
    return data || [];
    
  } catch (error) {
    console.error('❌ Erreur stock principal:', error);
    return [];
  }
};

// Fonction de chargement du stock PDV - SIMPLIFIÉE
const fetchStockPDVData = async () => {
  try {
    console.log('📊 Chargement du stock PDV...');
    
    const { data, error } = await supabase
      .from('stock_pdv')
      .select(`
        *,
        article:catalogue!stock_pdv_article_id_fkey(id, nom, reference, prix_vente, prix_achat),
        point_vente:points_de_vente!stock_pdv_point_vente_id_fkey(id, nom)
      `)
      .gt('quantite_disponible', 0)
      .limit(100); // Limiter pour éviter les requêtes trop lourdes
    
    if (error) {
      console.error('❌ Erreur stock PDV:', error);
      throw error;
    }
    
    console.log('✅ Stock PDV chargé:', data?.length || 0, 'entrées');
    return data || [];
    
  } catch (error) {
    console.error('❌ Erreur stock PDV:', error);
    return [];
  }
};

// Hooks spécialisés avec cache réduit et requêtes individuelles
export const useUltraFastCatalogue = () => {
  return useQuery({
    queryKey: ['catalogue-simple'],
    queryFn: fetchCatalogueData,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Permettre le rafraîchissement au montage
    retry: 1,
    retryDelay: 500,
  });
};

export const useUltraFastStock = () => {
  const stockPrincipal = useQuery({
    queryKey: ['stock-principal-simple'],
    queryFn: fetchStockPrincipalData,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    retryDelay: 500,
  });

  const stockPDV = useQuery({
    queryKey: ['stock-pdv-simple'],
    queryFn: fetchStockPDVData,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    retryDelay: 500,
  });

  return {
    stockEntrepot: stockPrincipal.data || [],
    stockPDV: stockPDV.data || [],
    isLoading: stockPrincipal.isLoading || stockPDV.isLoading,
    error: stockPrincipal.error || stockPDV.error
  };
};

export const useUltraFastConfig = () => {
  const entrepots = useQuery({
    queryKey: ['entrepots-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrepots')
        .select('*')
        .eq('statut', 'actif')
        .order('nom');
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const pointsDeVente = useQuery({
    queryKey: ['points-de-vente-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .select('*')
        .eq('statut', 'actif')
        .order('nom');
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const unites = useQuery({
    queryKey: ['unites-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unites')
        .select('*')
        .order('nom');
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    entrepots: entrepots.data || [],
    pointsDeVente: pointsDeVente.data || [],
    unites: (unites.data || []).map(u => ({
      ...u,
      type_unite: u.type_unite || 'quantite'
    })),
    isLoading: entrepots.isLoading || pointsDeVente.isLoading || unites.isLoading
  };
};

export const useUltraFastClients = () => {
  return useQuery({
    queryKey: ['clients-simple'],
    queryFn: async () => {
      console.log('👥 Chargement des clients...');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('statut_client', 'actif')
        .order('nom')
        .limit(50); // Limiter pour éviter les requêtes trop lourdes
      
      if (error) {
        console.error('❌ Erreur clients:', error);
        return [];
      }
      
      console.log('✅ Clients chargés:', data?.length || 0);
      return data || [];
    },
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    retryDelay: 500,
  });
};
