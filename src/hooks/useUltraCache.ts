
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

// Cache ultra-court pour des données fraîches - 30 secondes seulement
const CACHE_TIME = 30 * 1000;

// Hook principal ultra-simplifié
export const useUltraCache = () => {
  return {
    refreshAll: () => {
      console.log('🔄 Rafraîchissement global demandé');
    }
  };
};

// Fonction de chargement du catalogue - VERSION ULTRA-SIMPLE
const fetchCatalogueData = async () => {
  try {
    console.log('📦 Chargement catalogue ultra-rapide...');
    
    const { data, error } = await supabase
      .from('catalogue')
      .select('id, nom, reference, prix_vente, prix_achat, prix_unitaire, categorie, unite_mesure, seuil_alerte, image_url, statut')
      .eq('statut', 'actif')
      .order('nom')
      .limit(100); // Limite stricte
    
    if (error) {
      console.error('❌ Erreur catalogue:', error);
      return [];
    }
    
    console.log('✅ Catalogue chargé ultra-rapide:', data?.length || 0, 'articles');
    return data || [];
    
  } catch (error) {
    console.error('❌ Erreur catalogue:', error);
    return [];
  }
};

// Fonction de chargement du stock principal - VERSION ULTRA-SIMPLE
const fetchStockPrincipalData = async () => {
  try {
    console.log('📊 Chargement stock principal ultra-rapide...');
    
    const { data, error } = await supabase
      .from('stock_principal')
      .select(`
        id, article_id, entrepot_id, quantite_disponible, quantite_reservee, seuil_alerte,
        article:catalogue!stock_principal_article_id_fkey(id, nom, reference, prix_vente, prix_achat, prix_unitaire),
        entrepot:entrepots!stock_principal_entrepot_id_fkey(id, nom)
      `)
      .gt('quantite_disponible', 0)
      .limit(50); // Limite très stricte
    
    if (error) {
      console.error('❌ Erreur stock principal:', error);
      return [];
    }
    
    console.log('✅ Stock principal chargé ultra-rapide:', data?.length || 0, 'entrées');
    return data || [];
    
  } catch (error) {
    console.error('❌ Erreur stock principal:', error);
    return [];
  }
};

// Fonction de chargement du stock PDV - VERSION ULTRA-SIMPLE
const fetchStockPDVData = async () => {
  try {
    console.log('📊 Chargement stock PDV ultra-rapide...');
    
    const { data, error } = await supabase
      .from('stock_pdv')
      .select(`
        id, article_id, point_vente_id, quantite_disponible, quantite_reservee, seuil_alerte,
        article:catalogue!stock_pdv_article_id_fkey(id, nom, reference, prix_vente, prix_achat, prix_unitaire),
        point_vente:points_de_vente!stock_pdv_point_vente_id_fkey(id, nom)
      `)
      .gt('quantite_disponible', 0)
      .limit(50); // Limite très stricte
    
    if (error) {
      console.error('❌ Erreur stock PDV:', error);
      return [];
    }
    
    console.log('✅ Stock PDV chargé ultra-rapide:', data?.length || 0, 'entrées');
    return data || [];
    
  } catch (error) {
    console.error('❌ Erreur stock PDV:', error);
    return [];
  }
};

// Hooks spécialisés ultra-rapides avec cache minimal
export const useUltraFastCatalogue = () => {
  const query = useQuery({
    queryKey: ['catalogue-ultra-fast'],
    queryFn: fetchCatalogueData,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Pas de refetch automatique
    retry: 0, // Pas de retry
    networkMode: 'online',
  });

  return {
    ...query,
    articles: query.data || []
  };
};

export const useUltraFastStock = () => {
  const stockPrincipal = useQuery({
    queryKey: ['stock-principal-ultra-fast'],
    queryFn: fetchStockPrincipalData,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    networkMode: 'online',
  });

  const stockPDV = useQuery({
    queryKey: ['stock-pdv-ultra-fast'],
    queryFn: fetchStockPDVData,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    networkMode: 'online',
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
    queryKey: ['entrepots-ultra-fast'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrepots')
        .select('id, nom, adresse, statut')
        .eq('statut', 'actif')
        .order('nom')
        .limit(20);
      if (error) return [];
      return data || [];
    },
    staleTime: CACHE_TIME * 2, // Plus long car moins volatile
    gcTime: CACHE_TIME * 4,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  });

  const pointsDeVente = useQuery({
    queryKey: ['points-de-vente-ultra-fast'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .select('id, nom, adresse, statut')
        .eq('statut', 'actif')
        .order('nom')
        .limit(20);
      if (error) return [];
      return data || [];
    },
    staleTime: CACHE_TIME * 2,
    gcTime: CACHE_TIME * 4,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  });

  const unites = useQuery({
    queryKey: ['unites-ultra-fast'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unites')
        .select('id, nom, symbole, type_unite')
        .order('nom')
        .limit(50);
      if (error) return [];
      return data || [];
    },
    staleTime: CACHE_TIME * 4, // Très long car très stable
    gcTime: CACHE_TIME * 8,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
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
    queryKey: ['clients-ultra-fast'],
    queryFn: async () => {
      console.log('👥 Chargement clients ultra-rapide...');
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, prenom, email, telephone, type_client, statut_client')
        .eq('statut_client', 'actif')
        .order('nom')
        .limit(30); // Limite très stricte
      
      if (error) {
        console.error('❌ Erreur clients:', error);
        return [];
      }
      
      console.log('✅ Clients chargés ultra-rapide:', data?.length || 0);
      return data || [];
    },
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  });
};
