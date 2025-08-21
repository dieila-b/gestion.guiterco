
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
    queryKey: ['catalogue-simple'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('vue_catalogue_optimise')
          .select('*')
          .order('nom');
        
        if (error) {
          console.error('Erreur catalogue:', error);
          throw error;
        }
        
        // Mapper vers le format attendu
        return data?.map(item => ({
          id: item.id,
          nom: item.nom,
          reference: item.reference,
          description: item.description,
          prix_achat: item.prix_achat,
          prix_vente: item.prix_vente,
          categorie: item.categorie_nom || item.categorie,
          unite_mesure: item.unite_nom || item.unite_mesure,
          categorie_id: item.id, // Fallback
          unite_id: item.id, // Fallback
          seuil_alerte: item.seuil_alerte,
          image_url: item.image_url,
          statut: item.statut,
          created_at: item.created_at,
          updated_at: item.updated_at
        })) as Article[] || [];
      } catch (error) {
        console.error('Error in catalogue query:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - catalogue change peu souvent
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 300,
  });

  return {
    articles,
    isLoading,
    error
  };
};

// Re-export optimized version
export * from './useCatalogueOptimized';
