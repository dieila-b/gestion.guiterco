
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Optimisation ultra-rapide avec limite stricte de données
export const useUltraFastCatalogue = () => {
  return useQuery({
    queryKey: ['ultra-catalogue'],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching catalogue data...');
        
        const { data, error } = await supabase
          .from('catalogue')
          .select('id, nom, reference, prix_vente, prix_achat, prix_unitaire, categorie, unite_mesure, seuil_alerte, image_url, statut, created_at, updated_at')
          .eq('statut', 'actif')
          .order('nom');
        
        if (error) {
          console.error('❌ Catalogue query error:', error);
          throw error;
        }
        
        console.log('✅ Catalogue loaded successfully:', data?.length || 0, 'articles');
        return data || [];
      } catch (error) {
        console.error('❌ Catalogue fetch error:', error);
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 secondes pour débugger
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2
  });
};

export const useUltraFastStock = () => {
  return useQuery({
    queryKey: ['ultra-stock'],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching stock data...');
        
        // Stock entrepôt - requête simplifiée
        const { data: stockEntrepot, error: errorEntrepot } = await supabase
          .from('stock_principal')
          .select('id, article_id, entrepot_id, quantite_disponible, quantite_reservee, emplacement, derniere_entree, created_at, updated_at')
          .order('derniere_entree', { ascending: false, nullsFirst: false });

        // Stock PDV - requête simplifiée
        const { data: stockPDV, error: errorPDV } = await supabase
          .from('stock_pdv')
          .select('id, article_id, point_vente_id, quantite_disponible, quantite_minimum, derniere_livraison, created_at, updated_at')
          .order('derniere_livraison', { ascending: false, nullsFirst: false });

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

        console.log('✅ Stock loaded successfully:', {
          entrepot: result.stockEntrepot.length,
          pdv: result.stockPDV.length,
          total: result.stockEntrepot.length + result.stockPDV.length
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
    staleTime: 30 * 1000, // 30 secondes pour déboguer
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2
  });
};

export const useUltraFastConfig = () => {
  return useQuery({
    queryKey: ['ultra-config'],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching config data...');
        
        const [entrepots, pointsDeVente, unites] = await Promise.all([
          supabase
            .from('entrepots')
            .select('id, nom, adresse, gestionnaire, statut, created_at, updated_at')
            .eq('statut', 'actif')
            .order('nom'),
          
          supabase
            .from('points_de_vente')
            .select('id, nom, adresse, type_pdv, responsable, statut, created_at, updated_at')
            .eq('statut', 'actif')
            .order('nom'),
          
          supabase
            .from('unites')
            .select('id, nom, symbole, type_unite, statut')
            .order('nom')
        ]);

        if (entrepots.error) console.error('❌ Entrepots error:', entrepots.error);
        if (pointsDeVente.error) console.error('❌ Points de vente error:', pointsDeVente.error);
        if (unites.error) console.error('❌ Unites error:', unites.error);

        const result = {
          entrepots: entrepots.data || [],
          pointsDeVente: pointsDeVente.data || [],
          unites: unites.data || []
        };

        console.log('✅ Config loaded successfully:', {
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
    staleTime: 30 * 1000, // 30 secondes pour débugger
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2
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
