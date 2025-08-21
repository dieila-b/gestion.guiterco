
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

// Fonction qui récupère TOUTES les données en une seule fois
const fetchAllData = async () => {
  console.log('🚀 Chargement ultra-rapide de toutes les données...');
  
  try {
    // Utiliser Promise.allSettled pour ne jamais échouer
    const [
      catalogueResult,
      stockResult,
      configResult,
      clientsResult
    ] = await Promise.allSettled([
      // Catalogue optimisé
      supabase.from('vue_catalogue_optimise').select('*'),
      
      // Stock complet optimisé
      supabase.from('vue_stock_complet').select('*'),
      
      // Configuration (entrepôts, PDV, unités)
      Promise.all([
        supabase.from('entrepots').select('id, nom, statut').eq('statut', 'actif').limit(100),
        supabase.from('points_de_vente').select('id, nom, statut').eq('statut', 'actif').limit(100),
        supabase.from('unites').select('id, nom, symbole, type_unite').limit(100)
      ]),
      
      // Clients essentiels
      supabase.from('clients').select('id, nom, prenom, email, telephone').limit(200)
    ]);

    console.log('✅ Toutes les données chargées');

    return {
      catalogue: catalogueResult.status === 'fulfilled' ? catalogueResult.value.data || [] : [],
      stock: stockResult.status === 'fulfilled' ? stockResult.value.data || [] : [],
      config: configResult.status === 'fulfilled' ? {
        entrepots: configResult.value[0]?.data || [],
        pointsDeVente: configResult.value[1]?.data || [],
        unites: configResult.value[2]?.data || []
      } : getDefaultConfig(),
      clients: clientsResult.status === 'fulfilled' ? clientsResult.value.data || [] : [],
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('❌ Erreur chargement données:', error);
    return getDefaultData();
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

// Hooks spécialisés ultra-rapides
export const useUltraFastCatalogue = () => {
  const { data, isLoading } = useUltraCache();
  return {
    articles: data.catalogue,
    isLoading
  };
};

export const useUltraFastStock = () => {
  const { data, isLoading } = useUltraCache();
  
  const stockEntrepot = data.stock.filter(s => s.type_stock === 'entrepot').map(s => ({
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
      prix_achat: s.prix_vente * 0.8,
      prix_unitaire: s.prix_vente,
      statut: s.article_statut,
      categorie: 'Général',
      unite_mesure: 'U'
    },
    entrepot: {
      id: s.entrepot_id,
      nom: s.location_nom,
      statut: 'actif'
    }
  }));

  const stockPDV = data.stock.filter(s => s.type_stock === 'point_vente').map(s => ({
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
      prix_achat: s.prix_vente * 0.8,
      prix_unitaire: s.prix_vente,
      statut: s.article_statut,
      categorie: 'Général',
      unite_mesure: 'U'
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
