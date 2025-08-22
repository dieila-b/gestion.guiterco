
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

// Cache ultra-agressif - 30 minutes pour tout
const ULTRA_CACHE_TIME = 30 * 60 * 1000;

// Hook principal qui charge TOUT en une seule fois avec les vraies données
export const useUltraCache = () => {
  const queryClient = useQueryClient();

  // Précharger immédiatement toutes les données essentielles
  useEffect(() => {
    // Précharger en arrière-plan
    queryClient.prefetchQuery({
      queryKey: ['ultra-all-data'],
      queryFn: fetchAllRealData,
      staleTime: ULTRA_CACHE_TIME,
    });
  }, [queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ['ultra-all-data'],
    queryFn: fetchAllRealData,
    staleTime: ULTRA_CACHE_TIME,
    gcTime: ULTRA_CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 3,
    retryDelay: 1000,
  });

  return {
    data: data || getDefaultData(),
    isLoading,
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
    }
  };
};

// Fonction qui récupère TOUTES les données directement depuis les tables principales
const fetchAllRealData = async () => {
  console.log('🚀 Chargement synchronisé des données réelles depuis Supabase...');
  
  try {
    // D'abord, rafraîchir les vues matérialisées
    await supabase.rpc('refresh_stock_views');

    const [
      catalogueResult,
      stockPrincipalResult,
      stockPDVResult,
      configResult,
      clientsResult
    ] = await Promise.allSettled([
      // Catalogue depuis la vue optimisée
      fetchCatalogueData(),
      
      // Stock principal avec relations complètes
      fetchStockPrincipalData(),
      
      // Stock PDV avec relations complètes
      fetchStockPDVData(),
      
      // Configuration
      fetchConfigData(),
      
      // Clients
      fetchClientsData()
    ]);

    console.log('✅ Résultats du chargement des données réelles:', {
      catalogue: catalogueResult.status === 'fulfilled' ? catalogueResult.value?.length : 0,
      stockPrincipal: stockPrincipalResult.status === 'fulfilled' ? stockPrincipalResult.value?.length : 0,
      stockPDV: stockPDVResult.status === 'fulfilled' ? stockPDVResult.value?.length : 0,
      config: configResult.status === 'fulfilled' ? 'OK' : 'ERROR',
      clients: clientsResult.status === 'fulfilled' ? clientsResult.value?.length : 0
    });

    return {
      catalogue: catalogueResult.status === 'fulfilled' ? catalogueResult.value || [] : [],
      stockPrincipal: stockPrincipalResult.status === 'fulfilled' ? stockPrincipalResult.value || [] : [],
      stockPDV: stockPDVResult.status === 'fulfilled' ? stockPDVResult.value || [] : [],
      stock: [
        ...(stockPrincipalResult.status === 'fulfilled' ? stockPrincipalResult.value || [] : []).map(s => ({ ...s, type_stock: 'entrepot' })),
        ...(stockPDVResult.status === 'fulfilled' ? stockPDVResult.value || [] : []).map(s => ({ ...s, type_stock: 'point_vente' }))
      ],
      config: configResult.status === 'fulfilled' ? configResult.value || getDefaultConfig() : getDefaultConfig(),
      clients: clientsResult.status === 'fulfilled' ? clientsResult.value || [] : [],
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('❌ Erreur chargement données:', error);
    return getDefaultData();
  }
};

// Catalogue avec toutes les relations - CORRIGÉ
const fetchCatalogueData = async () => {
  try {
    console.log('📦 Chargement du catalogue complet...');
    
    const { data, error } = await supabase
      .from('catalogue')
      .select(`
        *,
        categories:categories_catalogue!catalogue_categorie_id_fkey(nom, couleur),
        unites:unites!catalogue_unite_id_fkey(nom, symbole, type_unite)
      `)
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

// Stock principal avec toutes les relations - CORRIGÉ
const fetchStockPrincipalData = async () => {
  try {
    console.log('📊 Chargement du stock principal...');
    
    const { data, error } = await supabase
      .from('stock_principal')
      .select(`
        *,
        article:catalogue!stock_principal_article_id_fkey(
          id, reference, nom, prix_vente, prix_achat, prix_unitaire, 
          statut, categorie, unite_mesure,
          categories:categories_catalogue!catalogue_categorie_id_fkey(nom),
          unites:unites!catalogue_unite_id_fkey(nom, symbole)
        ),
        entrepot:entrepots!stock_principal_entrepot_id_fkey(id, nom, statut)
      `)
      .gt('quantite_disponible', 0)
      .order('updated_at', { ascending: false });
    
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

// Stock PDV avec toutes les relations - CORRIGÉ
const fetchStockPDVData = async () => {
  try {
    console.log('📊 Chargement du stock PDV...');
    
    const { data, error } = await supabase
      .from('stock_pdv')
      .select(`
        *,
        article:catalogue!stock_pdv_article_id_fkey(
          id, reference, nom, prix_vente, prix_achat, prix_unitaire, 
          statut, categorie, unite_mesure,
          categories:categories_catalogue!catalogue_categorie_id_fkey(nom),
          unites:unites!catalogue_unite_id_fkey(nom, symbole)
        ),
        point_vente:points_de_vente!stock_pdv_point_vente_id_fkey(id, nom, statut)
      `)
      .gt('quantite_disponible', 0)
      .order('updated_at', { ascending: false });
    
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

// Configuration avec toutes les données
const fetchConfigData = async () => {
  try {
    console.log('⚙️ Chargement de la configuration...');
    
    const [entrepotResult, pdvResult, unitesResult] = await Promise.allSettled([
      supabase.from('entrepots').select('*').eq('statut', 'actif').order('nom'),
      supabase.from('points_de_vente').select('*').eq('statut', 'actif').order('nom'),
      supabase.from('unites').select('*').order('nom')
    ]);
    
    const config = {
      entrepots: entrepotResult.status === 'fulfilled' ? entrepotResult.value.data || [] : [],
      pointsDeVente: pdvResult.status === 'fulfilled' ? pdvResult.value.data || [] : [],
      unites: unitesResult.status === 'fulfilled' ? unitesResult.value.data || [] : []
    };
    
    console.log('✅ Configuration chargée:', {
      entrepots: config.entrepots.length,
      pdv: config.pointsDeVente.length,
      unites: config.unites.length
    });
    
    return config;
    
  } catch (error) {
    console.error('❌ Erreur configuration:', error);
    return getDefaultConfig();
  }
};

// Clients complets
const fetchClientsData = async () => {
  try {
    console.log('👥 Chargement des clients...');
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('statut_client', 'actif')
      .order('nom');
    
    if (error) {
      console.error('❌ Erreur clients:', error);
      return [];
    }
    
    console.log('✅ Clients chargés:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erreur clients:', error);
    return [];
  }
};

const getDefaultData = () => ({
  catalogue: [],
  stockPrincipal: [],
  stockPDV: [],
  stock: [],
  config: getDefaultConfig(),
  clients: [],
  timestamp: Date.now()
});

const getDefaultConfig = () => ({
  entrepots: [],
  pointsDeVente: [],
  unites: []
});

// Hooks spécialisés ultra-rapides utilisant les données réelles
export const useUltraFastCatalogue = () => {
  const { data, isLoading } = useUltraCache();
  return {
    articles: data.catalogue,
    isLoading
  };
};

export const useUltraFastStock = () => {
  const { data, isLoading } = useUltraCache();
  
  return {
    stockEntrepot: data.stockPrincipal,
    stockPDV: data.stockPDV,
    isLoading,
    error: null
  };
};

export const useUltraFastConfig = () => {
  const { data, isLoading } = useUltraCache();
  return {
    entrepots: data.config.entrepots,
    pointsDeVente: data.config.pointsDeVente,
    unites: data.config.unites.map(u => ({
      ...u,
      type_unite: u.type_unite || 'quantite'
    })),
    isLoading
  };
};

export const useUltraFastClients = () => {
  const { data, isLoading } = useUltraCache();
  return {
    data: data.clients,
    isLoading
  };
};
