
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

// Cache ultra-agressif - 30 minutes pour éviter les requêtes excessives
const ULTRA_CACHE_TIME = 30 * 60 * 1000;

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['ultra-all-data'],
    queryFn: fetchAllData,
    staleTime: ULTRA_CACHE_TIME,
    gcTime: ULTRA_CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  return {
    data: data || getDefaultData(),
    isLoading,
    error,
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
    }
  };
};

// Fonction qui récupère TOUTES les données avec fallback sur les tables normales
const fetchAllData = async () => {
  console.log('🚀 Chargement ultra-rapide des données...');
  
  try {
    const [
      catalogueResult,
      stockResult,
      configResult,
      clientsResult
    ] = await Promise.allSettled([
      // Catalogue avec fallback
      fetchCatalogueWithFallback(),
      
      // Stock avec fallback
      fetchStockWithFallback(),
      
      // Configuration
      fetchConfigWithFallback(),
      
      // Clients
      fetchClientsWithFallback()
    ]);

    console.log('✅ Résultats du chargement:', {
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

// Catalogue avec fallback sur table normale
const fetchCatalogueWithFallback = async () => {
  try {
    console.log('📦 Tentative de chargement du catalogue depuis vue optimisée...');
    
    // Essayer la vue matérialisée d'abord
    let { data, error } = await supabase
      .from('vue_catalogue_optimise')
      .select('*')
      .limit(1000);
    
    if (error || !data || data.length === 0) {
      console.log('⚠️ Vue optimisée vide, fallback vers table normale...');
      
      // Fallback vers la table normale avec jointures
      const result = await supabase
        .from('catalogue')
        .select(`
          *,
          categories:categories_catalogue(nom, couleur),
          unites:unites(nom, symbole)
        `)
        .eq('statut', 'actif')
        .limit(1000);
      
      if (result.error) throw result.error;
      
      // Transformer les données pour correspondre au format attendu
      data = result.data?.map(item => ({
        ...item,
        categorie: item.categories?.nom || item.categorie || 'Général',
        unite_mesure: item.unites?.nom || item.unite_mesure || 'U',
        categorie_couleur: item.categories?.couleur,
        unite_symbole: item.unites?.symbole
      }));
    }
    
    console.log('✅ Catalogue chargé:', data?.length || 0, 'articles');
    return data || [];
    
  } catch (error) {
    console.error('❌ Erreur catalogue:', error);
    return [];
  }
};

// Stock avec fallback sur tables normales
const fetchStockWithFallback = async () => {
  try {
    console.log('📊 Tentative de chargement du stock depuis vue optimisée...');
    
    // Essayer la vue matérialisée d'abord
    let { data, error } = await supabase
      .from('vue_stock_complet')
      .select('*')
      .limit(2000);
    
    if (error || !data || data.length === 0) {
      console.log('⚠️ Vue stock vide, fallback vers tables normales...');
      
      // Fallback vers les tables normales avec jointures
      const [stockEntrepotResult, stockPDVResult] = await Promise.all([
        supabase
          .from('stock_principal')
          .select(`
            *,
            article:catalogue(*,
              categories:categories_catalogue(nom),
              unites:unites(nom, symbole)
            ),
            entrepot:entrepots(nom)
          `)
          .gt('quantite_disponible', 0)
          .limit(1000),
        
        supabase
          .from('stock_pdv')
          .select(`
            *,
            article:catalogue(*,
              categories:categories_catalogue(nom),
              unites:unites(nom, symbole)
            ),
            point_vente:points_de_vente(nom)
          `)
          .gt('quantite_disponible', 0)
          .limit(1000)
      ]);
      
      if (stockEntrepotResult.error) throw stockEntrepotResult.error;
      if (stockPDVResult.error) throw stockPDVResult.error;
      
      // Transformer en format unifié
      data = [
        ...(stockEntrepotResult.data || []).map(item => ({
          ...item,
          type_stock: 'entrepot',
          article_reference: item.article?.reference,
          article_nom: item.article?.nom,
          prix_vente: item.article?.prix_vente,
          prix_achat: item.article?.prix_achat,
          article_statut: item.article?.statut,
          categorie_nom: item.article?.categories?.nom || item.article?.categorie,
          unite_nom: item.article?.unites?.nom || item.article?.unite_mesure,
          unite_symbole: item.article?.unites?.symbole,
          location_nom: item.entrepot?.nom
        })),
        ...(stockPDVResult.data || []).map(item => ({
          ...item,
          type_stock: 'point_vente',
          article_reference: item.article?.reference,
          article_nom: item.article?.nom,
          prix_vente: item.article?.prix_vente,
          prix_achat: item.article?.prix_achat,
          article_statut: item.article?.statut,
          categorie_nom: item.article?.categories?.nom || item.article?.categorie,
          unite_nom: item.article?.unites?.nom || item.article?.unite_mesure,
          unite_symbole: item.article?.unites?.symbole,
          location_nom: item.point_vente?.nom
        }))
      ];
    }
    
    console.log('✅ Stock chargé:', data?.length || 0, 'entrées');
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

// Hooks spécialisés ultra-rapides
export const useUltraFastCatalogue = () => {
  const { data, isLoading, error } = useUltraCache();
  return {
    articles: data.catalogue,
    isLoading,
    error
  };
};

export const useUltraFastStock = () => {
  const { data, isLoading, error } = useUltraCache();
  
  // Séparer le stock par type
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
    error
  };
};

export const useUltraFastConfig = () => {
  const { data, isLoading, error } = useUltraCache();
  return {
    entrepots: data.config.entrepots,
    pointsDeVente: data.config.pointsDeVente,
    unites: data.config.unites.map(u => ({
      ...u,
      type_unite: u.type_unite || 'quantite'
    })),
    isLoading,
    error
  };
};

export const useUltraFastClients = () => {
  const { data, isLoading, error } = useUltraCache();
  return {
    data: data.clients,
    isLoading,
    error
  };
};
