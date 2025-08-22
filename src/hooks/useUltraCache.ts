
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Optimisation ultra-rapide avec limite stricte de données
export const useUltraFastCatalogue = () => {
  return useQuery({
    queryKey: ['ultra-catalogue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogue')
        .select(`
          id,
          nom,
          reference,
          prix_vente,
          prix_achat,
          prix_unitaire,
          categorie,
          unite_mesure,
          seuil_alerte,
          image_url,
          statut,
          categories:categories_catalogue(nom),
          unites:unites(nom)
        `)
        .eq('statut', 'actif')
        .limit(100); // Limite stricte
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });
};

export const useUltraFastStock = () => {
  return useQuery({
    queryKey: ['ultra-stock'],
    queryFn: async () => {
      // Stock entrepôt avec toutes les colonnes nécessaires
      const { data: stockEntrepot, error: errorEntrepot } = await supabase
        .from('stock_principal')
        .select(`
          id,
          article_id,
          entrepot_id,
          quantite_disponible,
          quantite_reservee,
          emplacement,
          derniere_entree,
          derniere_sortie,
          created_at,
          updated_at,
          article:catalogue(
            id,
            nom,
            reference,
            prix_vente,
            prix_achat,
            prix_unitaire,
            categorie,
            unite_mesure,
            seuil_alerte,
            image_url,
            categories:categories_catalogue(nom),
            unites:unites(nom)
          ),
          entrepot:entrepots(
            id,
            nom,
            adresse,
            capacite_max,
            gestionnaire,
            statut,
            created_at,
            updated_at
          )
        `)
        .gt('quantite_disponible', 0)
        .limit(50);

      // Stock PDV avec toutes les colonnes nécessaires
      const { data: stockPDV, error: errorPDV } = await supabase
        .from('stock_pdv')
        .select(`
          id,
          article_id,
          point_vente_id,
          quantite_disponible,
          quantite_minimum,
          derniere_livraison,
          created_at,
          updated_at,
          article:catalogue(
            id,
            nom,
            reference,
            prix_vente,
            prix_achat,
            prix_unitaire,
            categorie,
            unite_mesure,
            seuil_alerte,
            image_url,
            categories:categories_catalogue(nom),
            unites:unites(nom)
          ),
          point_vente:points_de_vente(
            id,
            nom,
            adresse,
            type_pdv,
            responsable,
            statut,
            created_at,
            updated_at
          )
        `)
        .gt('quantite_disponible', 0)
        .limit(50);

      // Gérer les erreurs potentielles mais retourner les données disponibles
      const stockEntrepotData = errorEntrepot ? [] : (stockEntrepot || []);
      const stockPDVData = errorPDV ? [] : (stockPDV || []);

      return {
        stockEntrepot: stockEntrepotData,
        stockPDV: stockPDVData
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 6 * 60 * 1000, // 6 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });
};

export const useUltraFastConfig = () => {
  return useQuery({
    queryKey: ['ultra-config'],
    queryFn: async () => {
      // Entrepôts avec toutes les colonnes
      const { data: entrepots, error: errorEntrepots } = await supabase
        .from('entrepots')
        .select(`
          id,
          nom,
          adresse,
          capacite_max,
          gestionnaire,
          statut,
          created_at,
          updated_at
        `)
        .eq('statut', 'actif')
        .limit(20);

      // Points de vente avec toutes les colonnes
      const { data: pointsDeVente, error: errorPDV } = await supabase
        .from('points_de_vente')
        .select(`
          id,
          nom,
          adresse,
          type_pdv,
          responsable,
          statut,
          created_at,
          updated_at
        `)
        .eq('statut', 'actif')
        .limit(20);

      // Unités
      const { data: unites, error: errorUnites } = await supabase
        .from('unites')
        .select('id, nom, symbole')
        .limit(20);

      return {
        entrepots: errorEntrepots ? [] : (entrepots || []),
        pointsDeVente: errorPDV ? [] : (pointsDeVente || []),
        unites: errorUnites ? [] : (unites || [])
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });
};

export const useUltraFastClients = () => {
  return useQuery({
    queryKey: ['ultra-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, prenom, email, telephone, statut_client')
        .eq('statut_client', 'actif')
        .limit(30);
      
      if (error) return [];
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });
};
