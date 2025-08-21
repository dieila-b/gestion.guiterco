import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

// Cache ultra agressif - 30 minutes pour données stables
const ULTRA_CACHE_TIME = 30 * 60 * 1000;
const MEGA_CACHE_TIME = 60 * 60 * 1000; // 1 heure pour données très stables

// Hook principal consolidé qui remplace TOUS les autres hooks de stock
export const useConsolidatedData = () => {
  const queryClient = useQueryClient();

  // 1. Vue catalogue complète avec cache 1 heure
  const { data: catalogueData, isLoading: catalogueLoading } = useQuery({
    queryKey: ['ultra-catalogue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vue_catalogue_optimise')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    staleTime: MEGA_CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // 2. Vue stock complète avec cache 30 minutes
  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ['ultra-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vue_stock_complet')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    staleTime: ULTRA_CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // 3. Données de configuration (entrepôts, PDV, unités) - cache 1 heure
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['ultra-config'],
    queryFn: async () => {
      const [entrepots, pdv, unites] = await Promise.all([
        supabase.from('entrepots').select('id, nom, statut').eq('statut', 'actif'),
        supabase.from('points_de_vente').select('id, nom, statut').eq('statut', 'actif'),
        supabase.from('unites').select('id, nom, symbole, statut, type_unite').order('nom')
      ]);

      return {
        entrepots: entrepots.data || [],
        pointsDeVente: pdv.data || [],
        unites: unites.data || []
      };
    },
    staleTime: MEGA_CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Données calculées en mémoire
  const computedData = useMemo(() => {
    if (!catalogueData || !stockData || !configData) {
      return {
        articles: [],
        stockEntrepot: [],
        stockPDV: [],
        entrepots: [],
        pointsDeVente: [],
        unites: [],
        stockStats: { totalArticles: 0, totalStock: 0 }
      };
    }

    // Séparation stock entrepôt vs PDV
    const stockEntrepot = stockData.filter(s => s.type_stock === 'entrepot');
    const stockPDV = stockData.filter(s => s.type_stock === 'point_vente');

    // Statistiques rapides
    const stockStats = {
      totalArticles: catalogueData.length,
      totalStock: stockData.reduce((sum, s) => sum + (s.quantite_disponible || 0), 0)
    };

    return {
      articles: catalogueData,
      stockEntrepot: stockEntrepot.map(s => ({
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
          prix_achat: s.prix_vente * 0.8, // Estimation
          prix_unitaire: s.prix_vente,
          statut: s.article_statut,
          categorie: 'Général', // Valeur par défaut
          unite_mesure: 'U',
          categorie_article: { nom: 'Général' },
          unite_article: { nom: 'Unité' }
        },
        entrepot: {
          id: s.entrepot_id,
          nom: s.location_nom,
          statut: 'actif'
        }
      })),
      stockPDV: stockPDV.map(s => ({
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
          unite_mesure: 'U',
          categorie_article: { nom: 'Général' },
          unite_article: { nom: 'Unité' }
        },
        point_vente: {
          id: s.point_vente_id,
          nom: s.location_nom,
          statut: 'actif'
        }
      })),
      entrepots: configData.entrepots,
      pointsDeVente: configData.pointsDeVente,
      unites: configData.unites,
      stockStats
    };
  }, [catalogueData, stockData, configData]);

  const isLoading = catalogueLoading || stockLoading || configLoading;

  // Fonction de rafraîchissement pour toutes les données
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['ultra-catalogue'] });
    queryClient.invalidateQueries({ queryKey: ['ultra-stock'] });
    queryClient.invalidateQueries({ queryKey: ['ultra-config'] });
  };

  return {
    ...computedData,
    isLoading,
    refreshAll
  };
};

// Hook simplifié pour le catalogue uniquement
export const useFastCatalogue = () => {
  const { articles, isLoading } = useConsolidatedData();
  return { articles, isLoading };
};

// Hook simplifié pour le stock entrepôt uniquement
export const useFastStockPrincipal = () => {
  const { stockEntrepot, isLoading, refreshAll } = useConsolidatedData();
  return { 
    stockEntrepot, 
    isLoading, 
    error: null, // Ajout pour compatibilité
    refreshStock: refreshAll 
  };
};

// Hook simplifié pour le stock PDV uniquement
export const useFastStockPDV = () => {
  const { stockPDV, isLoading } = useConsolidatedData();
  return { 
    stockPDV, 
    isLoading, 
    error: null // Ajout pour compatibilité
  };
};

// Hook simplifié pour les entrepôts uniquement
export const useFastEntrepots = () => {
  const { entrepots, isLoading } = useConsolidatedData();
  return { data: entrepots, isLoading };
};

// Hook simplifié pour les points de vente uniquement
export const useFastPointsDeVente = () => {
  const { pointsDeVente, isLoading } = useConsolidatedData();
  return { data: pointsDeVente, isLoading };
};

// Hook simplifié pour les unités uniquement
export const useFastUnites = () => {
  const { unites, isLoading } = useConsolidatedData();
  // Mapper pour ajouter type_unite manquant
  const unitesWithType = unites.map(u => ({
    ...u,
    type_unite: u.type_unite || 'quantite'
  }));
  return { data: unitesWithType, isLoading };
};