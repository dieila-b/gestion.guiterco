
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Article {
  id: string;
  nom: string;
  reference: string;
  prix_achat?: number;
  prix_vente?: number;
  prix_unitaire?: number; // Maintenu pour compatibilité
  categorie?: string;
  unite_mesure?: string;
  description?: string;
  image_url?: string;
  statut?: string;
  seuil_alerte?: number;
  categorie_id?: string;
  unite_id?: string;
}

export const useCatalogue = () => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['catalogue'],
    queryFn: async () => {
      console.log('🔍 Récupération du catalogue...');
      
      // Première tentative : requête complète
      try {
        const { data, error } = await supabase
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
            created_at,
            updated_at
          `)
          .order('nom', { ascending: true });
        
        if (error) {
          console.error('❌ Erreur catalogue complète:', error);
          
          // Tentative simplifiée
          const { data: simpleData, error: simpleError } = await supabase
            .from('catalogue')
            .select('id, nom, reference, prix_vente, statut')
            .order('nom', { ascending: true });
          
          if (simpleError) {
            console.error('❌ Erreur catalogue simple:', simpleError);
            throw simpleError;
          }
          
          console.log('✅ Catalogue simple récupéré:', simpleData?.length || 0);
          return simpleData as Article[];
        }
        
        console.log('✅ Catalogue complet récupéré:', data?.length || 0);
        console.log('Premier article:', data?.[0]);
        return data as Article[];
        
      } catch (err) {
        console.error('💥 Erreur lors de la récupération du catalogue:', err);
        
        // Dernière tentative : récupération basique
        try {
          const { data: basicData, error: basicError } = await supabase
            .from('catalogue')
            .select('*');
          
          if (basicError) throw basicError;
          
          console.log('✅ Catalogue basique récupéré:', basicData?.length || 0);
          return (basicData as Article[]) || [];
        } catch (finalErr) {
          console.error('💥 Toutes les tentatives ont échoué pour le catalogue:', finalErr);
          return [];
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    articles,
    isLoading,
    error
  };
};

// Re-export optimized version
export * from './useCatalogueOptimized';
