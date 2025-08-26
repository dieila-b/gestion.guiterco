
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
          .select('id, nom, reference, prix_vente, prix_achat, prix_unitaire, categorie, unite_mesure, seuil_alerte, image_url, statut')
          .eq('statut', 'actif')
          .order('nom')
          .limit(200);
        
        if (error) {
          console.error('❌ Catalogue query error:', error);
          throw error;
        }
        
        console.log('✅ Catalogue loaded:', data?.length || 0, 'items');
        return data || [];
      } catch (error) {
        console.error('❌ Catalogue fetch error:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1
  });
};

export const useUltraFastStock = () => {
  return useQuery({
    queryKey: ['ultra-stock'],
    queryFn: async () => {
      try {
        // Stock entrepôt - requête simplifiée
        const { data: stockEntrepot, error: errorEntrepot } = await supabase
          .from('stock_principal')
          .select('id, article_id, entrepot_id, quantite_disponible, quantite_reservee, emplacement, derniere_entree')
          .gt('quantite_disponible', 0)
          .order('derniere_entree', { ascending: false })
          .limit(100);

        // Stock PDV - requête simplifiée
        const { data: stockPDV, error: errorPDV } = await supabase
          .from('stock_pdv')
          .select('id, article_id, point_vente_id, quantite_disponible, quantite_minimum, derniere_livraison')
          .gt('quantite_disponible', 0)
          .order('derniere_livraison', { ascending: false })
          .limit(100);

        if (errorEntrepot) {
          console.error('❌ Stock entrepot error:', errorEntrepot);
        }
        if (errorPDV) {
          console.error('❌ Stock PDV error:', errorPDV);
        }

        const result = {
          stockEntrepot: stockEntrepot || [],
          stockPDV: stockPDV || []
        };

        console.log('✅ Stock loaded:', {
          entrepot: result.stockEntrepot.length,
          pdv: result.stockPDV.length
        });

        return result;
      } catch (error) {
        console.error('❌ Stock fetch error:', error);
        return {
          stockEntrepot: [],
          stockPDV: []
        };
      }
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1
  });
};

export const useUltraFastConfig = () => {
  return useQuery({
    queryKey: ['ultra-config'],
    queryFn: async () => {
      try {
        const [entrepots, pointsDeVente, unites] = await Promise.all([
          supabase
            .from('entrepots')
            .select('id, nom, adresse, gestionnaire, statut')
            .eq('statut', 'actif')
            .order('nom')
            .limit(50),
          
          supabase
            .from('points_de_vente')
            .select('id, nom, adresse, type_pdv, responsable, statut')
            .eq('statut', 'actif')
            .order('nom')
            .limit(50),
          
          supabase
            .from('unites')
            .select('id, nom, symbole, type_unite')
            .order('nom')
            .limit(50)
        ]);

        if (entrepots.error) console.error('❌ Entrepots error:', entrepots.error);
        if (pointsDeVente.error) console.error('❌ Points de vente error:', pointsDeVente.error);
        if (unites.error) console.error('❌ Unites error:', unites.error);

        const result = {
          entrepots: entrepots.data || [],
          pointsDeVente: pointsDeVente.data || [],
          unites: unites.data || []
        };

        console.log('✅ Config loaded:', {
          entrepots: result.entrepots.length,
          pdv: result.pointsDeVente.length,
          unites: result.unites.length
        });

        return result;
      } catch (error) {
        console.error('❌ Config fetch error:', error);
        return {
          entrepots: [],
          pointsDeVente: [],
          unites: []
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1
  });
};

export const useUltraFastClients = () => {
  return useQuery({
    queryKey: ['ultra-clients'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, nom, prenom, email, telephone, statut_client, type_client')
          .in('statut_client', ['actif', 'particulier'])
          .order('nom')
          .limit(100);
        
        if (error) {
          console.error('❌ Clients error:', error);
          throw error;
        }
        
        console.log('✅ Clients loaded:', data?.length || 0, 'clients');
        return data || [];
      } catch (error) {
        console.error('❌ Clients fetch error:', error);
        return [];
      }
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1
  });
};
