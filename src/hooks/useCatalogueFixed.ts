
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDevMode } from '@/hooks/useDevMode';

export interface Article {
  id: string;
  nom: string;
  reference: string;
  prix_achat?: number;
  prix_vente?: number;
  prix_unitaire?: number;
  categorie?: string;
  unite_mesure?: string;
  description?: string;
  image_url?: string;
  statut?: string;
  seuil_alerte?: number;
  categorie_id?: string;
  unite_id?: string;
  frais_logistique?: number;
  frais_douane?: number;
  frais_transport?: number;
  autres_frais?: number;
}

export const useCatalogueFixed = () => {
  const { isDevMode, bypassAuth } = useDevMode();

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['catalogue-fixed'],
    queryFn: async () => {
      console.log('🔍 DIAGNOSTIC - Début requête catalogue...');
      console.log('🔧 Mode:', { isDevMode, bypassAuth });
      
      try {
        // Requête simple sans filtres complexes
        const { data, error, count } = await supabase
          .from('catalogue')
          .select(`
            id,
            nom,
            reference,
            description,
            prix_achat,
            prix_vente,
            prix_unitaire,
            categorie,
            unite_mesure,
            categorie_id,
            unite_id,
            seuil_alerte,
            image_url,
            statut,
            frais_logistique,
            frais_douane,
            frais_transport,
            autres_frais,
            created_at,
            updated_at
          `, { count: 'exact' })
          .order('created_at', { ascending: false });
        
        console.log('📊 DIAGNOSTIC - Résultat requête:', {
          dataLength: data?.length,
          totalCount: count,
          errorDetails: error,
          firstItems: data?.slice(0, 3)
        });
        
        if (error) {
          console.error('❌ DIAGNOSTIC - Erreur Supabase:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn('⚠️ DIAGNOSTIC - Aucune donnée retournée');
          console.log('🔍 Vérification auth:', await supabase.auth.getUser());
          return [];
        }
        
        console.log('✅ DIAGNOSTIC - Catalogue chargé avec succès:', data.length, 'articles');
        return data as Article[];
        
      } catch (error) {
        console.error('💥 DIAGNOSTIC - Erreur critique:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000
  });

  return {
    articles: articles || [],
    isLoading,
    error,
    isEmpty: !isLoading && (!articles || articles.length === 0)
  };
};
