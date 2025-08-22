
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Optimisation ultra-rapide avec limite stricte de données
export const useUltraFastCatalogue = () => {
  return useQuery({
    queryKey: ['ultra-catalogue'],
    queryFn: async () => {
      try {
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
            categorie_id,
            unite_id,
            categories:categories_catalogue!categorie_id(nom),
            unites:unites!unite_id(nom, symbole)
          `)
          .eq('statut', 'actif')
          .limit(100);
        
        if (error) {
          console.error('Catalogue query error:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('Catalogue fetch error:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });
};

export const useUltraFastStock = () => {
  return useQuery({
    queryKey: ['ultra-stock'],
    queryFn: async () => {
      try {
        // Stock entrepôt avec relation spécifiée
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
            article:catalogue!stock_principal_article_id_fkey(
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
              categorie_id,
              unite_id,
              categories:categories_catalogue!categorie_id(nom),
              unites:unites!unite_id(nom, symbole)
            ),
            entrepot:entrepots!stock_principal_entrepot_id_fkey(
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

        // Stock PDV avec relation spécifiée
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
            article:catalogue!stock_pdv_article_id_fkey(
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
              categorie_id,
              unite_id,
              categories:categories_catalogue!categorie_id(nom),
              unites:unites!unite_id(nom, symbole)
            ),
            point_vente:points_de_vente!stock_pdv_point_vente_id_fkey(
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

        if (errorEntrepot) console.error('Stock entrepot error:', errorEntrepot);
        if (errorPDV) console.error('Stock PDV error:', errorPDV);

        return {
          stockEntrepot: stockEntrepotData,
          stockPDV: stockPDVData
        };
      } catch (error) {
        console.error('Stock fetch error:', error);
        return {
          stockEntrepot: [],
          stockPDV: []
        };
      }
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 6 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });
};

export const useUltraFastConfig = () => {
  return useQuery({
    queryKey: ['ultra-config'],
    queryFn: async () => {
      try {
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

        // Unités avec tous les champs nécessaires
        const { data: unites, error: errorUnites } = await supabase
          .from('unites')
          .select(`
            id,
            nom,
            symbole,
            type_unite,
            statut
          `)
          .limit(20);

        if (errorEntrepots) console.error('Entrepots error:', errorEntrepots);
        if (errorPDV) console.error('Points de vente error:', errorPDV);
        if (errorUnites) console.error('Unites error:', errorUnites);

        return {
          entrepots: errorEntrepots ? [] : (entrepots || []),
          pointsDeVente: errorPDV ? [] : (pointsDeVente || []),
          unites: errorUnites ? [] : (unites || [])
        };
      } catch (error) {
        console.error('Config fetch error:', error);
        return {
          entrepots: [],
          pointsDeVente: [],
          unites: []
        };
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });
};

export const useUltraFastClients = () => {
  return useQuery({
    queryKey: ['ultra-clients'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, nom, prenom, email, telephone, statut_client')
          .eq('statut_client', 'actif')
          .limit(30);
        
        if (error) {
          console.error('Clients error:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('Clients fetch error:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });
};
