
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

// Cache ultra-agressif - 2 heures pour tout
const ULTRA_CACHE_TIME = 2 * 60 * 60 * 1000;

// Hook principal qui charge TOUT en une seule fois
export const useUltraCache = () => {
  const queryClient = useQueryClient();

  // Précharger immédiatement toutes les données essentielles
  useEffect(() => {
    // Précharger en arrière-plan
    queryClient.prefetchQuery({
      queryKey: ['ultra-all-data'],
      queryFn: fetchAllData,
      staleTime: ULTRA_CACHE_TIME,
    });
  }, [queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ['ultra-all-data'],
    queryFn: fetchAllData,
    staleTime: ULTRA_CACHE_TIME,
    gcTime: ULTRA_CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return {
    data: data || getDefaultData(),
    isLoading,
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
    }
  };
};

// Fonction qui récupère TOUTES les données avec les vues matérialisées optimisées
const fetchAllData = async () => {
  console.log('🚀 Chargement ultra-rapide depuis les vues matérialisées synchronisées...');
  
  try {
    const [
      catalogueResult,
      stockResult,
      configResult,
      clientsResult
    ] = await Promise.allSettled([
      // Catalogue depuis la vue matérialisée optimisée
      fetchCatalogueFromView(),
      
      // Stock depuis la vue matérialisée complète
      fetchStockFromView(),
      
      // Configuration
      fetchConfigWithFallback(),
      
      // Clients
      fetchClientsWithFallback()
    ]);

    console.log('✅ Résultats du chargement depuis vues matérialisées:', {
      catalogue: catalogueResult.status === 'fulfilled' ? catalogueResult.value?.length : 0,
      stock: stockResult.status === 'fulfilled' ? stockResult.value?.length : 0,
      config: configResult.status === 'fulfilled' ? 'OK' : 'ERROR',
      clients: clientsResult.status === 'fulfilled' ? clientsResult.value?.length : 0
    });

    return {
      catalogue: catalogueResult.status === 'fulfilled' ? catalogueResult.value || [] : [],
      stock: stockResult.status === 'fulfilled' ? stockResult.value || [] : [],
      config: configResult.status === 'fulfilled' ? configResult.value || getDefaultConfig() : getDefaultConfig(),
      clients: clientsResult.status === 'fulfilled' ? clientsResult.value || [] : [],
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('❌ Erreur chargement données:', error);
    return getDefaultData();
  }
};

// Catalogue depuis la vue matérialisée optimisée
const fetchCatalogueFromView = async () => {
  try {
    console.log('📦 Chargement du catalogue depuis vue_catalogue_optimise...');
    
    const { data, error } = await supabase
      .from('vue_catalogue_optimise')
      .select('*')
      .limit(1000);
    
    if (error) {
      console.error('❌ Erreur vue catalogue:', error);
      throw error;
    }
    
    console.log('✅ Catalogue chargé depuis vue matérialisée:', data?.length || 0, 'articles');
    return data || [];
    
  } catch (error) {
    console.error('❌ Erreur catalogue:', error);
    return [];
  }
};

// Stock depuis la vue matérialisée complète
const fetchStockFromView = async () => {
  try {
    console.log('📊 Chargement du stock depuis vue_stock_complet...');
    
    const { data, error } = await supabase
      .from('vue_stock_complet')
      .select('*')
      .limit(2000);
    
    if (error) {
      console.error('❌ Erreur vue stock:', error);
      throw error;
    }
    
    console.log('✅ Stock chargé depuis vue matérialisée:', data?.length || 0, 'entrées');
    return data || [];
    
  } catch (error) {
    console.error('❌ Erreur stock:', error);
    return [];
  }
};

// Configuration avec fallback
const fetchConfigWithFallback = async () => {
  try {
    console.log('⚙️ Chargement de la configuration...');
    
    const [entrepotResult, pdvResult, unitesResult] = await Promise.allSettled([
      supabase.from('entrepots').select('id, nom, statut').eq('statut', 'actif').limit(50),
      supabase.from('points_de_vente').select('id, nom, statut').eq('statut', 'actif').limit(50),
      supabase.from('unites').select('id, nom, symbole, type_unite').limit(50)
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

// Clients avec fallback
const fetchClientsWithFallback = async () => {
  try {
    console.log('👥 Chargement des clients...');
    
    const { data, error } = await supabase
      .from('clients')
      .select('id, nom, prenom, email, telephone, statut_client')
      .eq('statut_client', 'actif')
      .limit(200);
    
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

// Hooks spécialisés ultra-rapides utilisant les vues matérialisées
export const useUltraFastCatalogue = () => {
  const { data, isLoading } = useUltraCache();
  return {
    articles: data.catalogue,
    isLoading
  };
};

export const useUltraFastStock = () => {
  const { data, isLoading } = useUltraCache();
  
  // Séparer le stock par type depuis la vue matérialisée
  const stockEntrepot = data.stock
    .filter(s => s.type_stock === 'entrepot')
    .map(s => ({
      id: s.id,
      article_id: s.article_id,
      entrepot_id: s.entrepot_id,
      quantite_disponible: s.quantite_disponible,
      quantite_reservee: s.quantite_reservee || 0,
      emplacement: s.emplacement,
      derniere_entree: s.derniere_entree,
      derniere_sortie: s.derniere_sortie,
      created_at: s.created_at,
      updated_at: s.updated_at,
      article: {
        id: s.article_id,
        reference: s.article_reference,
        nom: s.article_nom,
        prix_vente: s.prix_vente,
        prix_achat: s.prix_achat,
        prix_unitaire: s.prix_vente,
        statut: s.article_statut,
        categorie: s.categorie_nom || 'Général',
        unite_mesure: s.unite_nom || 'U',
        categorie_article: { nom: s.categorie_nom || 'Général' },
        unite_article: { nom: s.unite_nom || 'U', symbole: s.unite_symbole || 'U' }
      },
      entrepot: {
        id: s.entrepot_id,
        nom: s.location_nom,
        statut: 'actif'
      }
    }));

  const stockPDV = data.stock
    .filter(s => s.type_stock === 'point_vente')
    .map(s => ({
      id: s.id,
      article_id: s.article_id,
      point_vente_id: s.point_vente_id,
      quantite_disponible: s.quantite_disponible,
      quantite_minimum: 0,
      derniere_livraison: s.derniere_entree,
      created_at: s.created_at,
      updated_at: s.updated_at,
      article: {
        id: s.article_id,
        reference: s.article_reference,
        nom: s.article_nom,
        prix_vente: s.prix_vente,
        prix_achat: s.prix_achat,
        prix_unitaire: s.prix_vente,
        statut: s.article_statut,
        categorie: s.categorie_nom || 'Général',
        unite_mesure: s.unite_nom || 'U',
        categorie_article: { nom: s.categorie_nom || 'Général' },
        unite_article: { nom: s.unite_nom || 'U', symbole: s.unite_symbole || 'U' }
      },
      point_vente: {
        id: s.point_vente_id,
        nom: s.location_nom,
        statut: 'actif'
      }
    }));

  return {
    stockEntrepot,
    stockPDV,
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
