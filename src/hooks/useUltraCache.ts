
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Cache en mémoire pour éviter les re-requêtes
const memoryCache = new Map();
const MEMORY_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

const getCachedData = (key: string) => {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  memoryCache.set(key, { data, timestamp: Date.now() });
};

// Fonction de test de connexion Supabase
const testSupabaseConnection = async () => {
  try {
    console.log('🔗 Test de connexion Supabase...');
    const { data, error } = await supabase
      .from('catalogue')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion Supabase:', error);
      return false;
    }
    
    console.log('✅ Connexion Supabase OK');
    return true;
  } catch (error) {
    console.error('❌ Erreur critique Supabase:', error);
    return false;
  }
};

// Optimisation ultra-rapide avec limite stricte de données
export const useUltraFastCatalogue = () => {
  return useQuery({
    queryKey: ['ultra-catalogue'],
    queryFn: async () => {
      try {
        // Test de connexion d'abord
        const connectionOk = await testSupabaseConnection();
        if (!connectionOk) {
          console.warn('⚠️ Problème de connexion Supabase - retour données vides');
          return [];
        }

        // Vérifier le cache mémoire d'abord
        const cachedResult = getCachedData('catalogue');
        if (cachedResult) {
          console.log('📦 Catalogue depuis cache mémoire:', cachedResult.length, 'articles');
          return cachedResult;
        }

        console.log('🔄 Chargement catalogue depuis Supabase...');
        const { data, error } = await supabase
          .from('catalogue')
          .select(`
            id,
            nom,
            reference,
            description,
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
            created_at,
            updated_at,
            categories:categories_catalogue!catalogue_categorie_id_fkey(nom, couleur),
            unites:unites!catalogue_unite_id_fkey(nom, symbole)
          `)
          .eq('statut', 'actif')
          .order('nom')
          .limit(100);
        
        if (error) {
          console.error('❌ Catalogue query error:', error);
          return [];
        }
        
        const result = data || [];
        setCachedData('catalogue', result);
        console.log(`✅ Catalogue chargé: ${result.length} articles`);
        return result;
      } catch (error) {
        console.error('❌ Catalogue fetch error:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Forcer le rechargement au montage
    retry: 2,
    retryDelay: 1000,
    networkMode: 'online',
  });
};

export const useUltraFastStock = () => {
  return useQuery({
    queryKey: ['ultra-stock'],
    queryFn: async () => {
      try {
        // Vérifier le cache mémoire d'abord
        const cachedResult = getCachedData('stock');
        if (cachedResult) {
          console.log('📦 Stock depuis cache mémoire');
          return cachedResult;
        }

        console.log('🔄 Chargement stock depuis Supabase...');
        
        // Requêtes en parallèle avec gestion d'erreur améliorée
        const [stockEntrepotResult, stockPDVResult] = await Promise.allSettled([
          supabase
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
                id, nom, reference, prix_vente, prix_achat, prix_unitaire,
                categorie, unite_mesure, seuil_alerte, image_url, statut
              ),
              entrepot:entrepots!stock_principal_entrepot_id_fkey(
                id, nom, adresse, capacite_max, gestionnaire, statut
              )
            `)
            .gte('quantite_disponible', 0)
            .order('quantite_disponible', { ascending: false })
            .limit(50),
          
          supabase
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
                id, nom, reference, prix_vente, prix_achat, prix_unitaire,
                categorie, unite_mesure, seuil_alerte, image_url, statut
              ),
              point_vente:points_de_vente!stock_pdv_point_vente_id_fkey(
                id, nom, adresse, type_pdv, responsable, statut
              )
            `)
            .gte('quantite_disponible', 0)
            .order('quantite_disponible', { ascending: false })
            .limit(50)
        ]);

        const stockEntrepot = stockEntrepotResult.status === 'fulfilled' ? (stockEntrepotResult.value.data || []) : [];
        const stockPDV = stockPDVResult.status === 'fulfilled' ? (stockPDVResult.value.data || []) : [];

        if (stockEntrepotResult.status === 'rejected') {
          console.warn('⚠️ Stock entrepot error:', stockEntrepotResult.reason);
        }
        if (stockPDVResult.status === 'rejected') {
          console.warn('⚠️ Stock PDV error:', stockPDVResult.reason);
        }

        const result = { stockEntrepot, stockPDV };
        setCachedData('stock', result);
        console.log(`✅ Stock chargé: ${stockEntrepot.length} entrepôt + ${stockPDV.length} PDV`);
        return result;
      } catch (error) {
        console.error('❌ Stock fetch error:', error);
        return { stockEntrepot: [], stockPDV: [] };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    networkMode: 'online',
  });
};

export const useUltraFastConfig = () => {
  return useQuery({
    queryKey: ['ultra-config'],
    queryFn: async () => {
      try {
        // Vérifier le cache mémoire d'abord
        const cachedResult = getCachedData('config');
        if (cachedResult) {
          console.log('📦 Config depuis cache mémoire');
          return cachedResult;
        }

        console.log('🔄 Chargement config depuis Supabase...');
        
        // Requêtes en parallèle avec gestion d'erreur
        const [entrepotResult, pdvResult, unitesResult, categoriesResult] = await Promise.allSettled([
          supabase
            .from('entrepots')
            .select('id, nom, adresse, capacite_max, gestionnaire, statut, created_at, updated_at')
            .eq('statut', 'actif')
            .order('nom')
            .limit(20),
          
          supabase
            .from('points_de_vente')
            .select('id, nom, adresse, type_pdv, responsable, statut, created_at, updated_at')
            .eq('statut', 'actif')
            .order('nom')
            .limit(20),
          
          supabase
            .from('unites')
            .select('id, nom, symbole, type_unite, statut')
            .order('nom')
            .limit(20),

          supabase
            .from('categories_catalogue')
            .select('id, nom, description, couleur, statut')
            .eq('statut', 'actif')
            .order('nom')
            .limit(20)
        ]);

        const entrepots = entrepotResult.status === 'fulfilled' ? (entrepotResult.value.data || []) : [];
        const pointsDeVente = pdvResult.status === 'fulfilled' ? (pdvResult.value.data || []) : [];
        const unites = unitesResult.status === 'fulfilled' ? (unitesResult.value.data || []) : [];
        const categories = categoriesResult.status === 'fulfilled' ? (categoriesResult.value.data || []) : [];

        if (entrepotResult.status === 'rejected') console.warn('⚠️ Entrepots error:', entrepotResult.reason);
        if (pdvResult.status === 'rejected') console.warn('⚠️ Points de vente error:', pdvResult.reason);
        if (unitesResult.status === 'rejected') console.warn('⚠️ Unites error:', unitesResult.reason);
        if (categoriesResult.status === 'rejected') console.warn('⚠️ Categories error:', categoriesResult.reason);

        const result = { entrepots, pointsDeVente, unites, categories };
        setCachedData('config', result);
        console.log(`✅ Config chargée: ${entrepots.length} entrepôts, ${pointsDeVente.length} PDV, ${unites.length} unités, ${categories.length} catégories`);
        return result;
      } catch (error) {
        console.error('❌ Config fetch error:', error);
        return { entrepots: [], pointsDeVente: [], unites: [], categories: [] };
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (plus long car change moins souvent)
    gcTime: 60 * 60 * 1000, // 1 heure
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    networkMode: 'online',
  });
};

export const useUltraFastClients = () => {
  return useQuery({
    queryKey: ['ultra-clients'],
    queryFn: async () => {
      try {
        // Vérifier le cache mémoire d'abord
        const cachedResult = getCachedData('clients');
        if (cachedResult) {
          console.log('📦 Clients depuis cache mémoire');
          return cachedResult;
        }

        console.log('🔄 Chargement clients depuis Supabase...');
        const { data, error } = await supabase
          .from('clients')
          .select(`
            id, 
            nom, 
            prenom, 
            email, 
            telephone, 
            adresse,
            ville,
            code_postal,
            statut_client,
            type_client,
            created_at,
            updated_at
          `)
          .eq('statut_client', 'actif')
          .order('nom')
          .limit(50);
        
        if (error) {
          console.error('❌ Clients error:', error);
          return [];
        }
        
        const result = data || [];
        setCachedData('clients', result);
        console.log(`✅ Clients chargés: ${result.length} clients`);
        return result;
      } catch (error) {
        console.error('❌ Clients fetch error:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    networkMode: 'online',
  });
};

// Nettoyer le cache mémoire périodiquement
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (now - value.timestamp > MEMORY_CACHE_TTL) {
      memoryCache.delete(key);
      console.log(`🧹 Cache expiré supprimé: ${key}`);
    }
  }
}, 5 * 60 * 1000); // Nettoyage toutes les 5 minutes

// Export de fonction utilitaire pour forcer le rechargement
export const clearMemoryCache = () => {
  memoryCache.clear();
  console.log('🧹 Cache mémoire vidé manuellement');
};
