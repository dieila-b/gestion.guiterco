
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ArticleOptimized {
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
  created_at?: string;
  updated_at?: string;
  // Relations
  categorie_article?: { nom: string };
  unite_article?: { nom: string };
}

export const useCatalogueOptimized = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles, isLoading, error, refetch } = useQuery({
    queryKey: ['catalogue-optimized'],
    queryFn: async () => {
      console.log('🔄 Fetching optimized catalogue data...');
      
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
            frais_logistique,
            frais_douane,
            frais_transport,
            autres_frais,
            created_at,
            updated_at,
            categorie_article:categories_catalogue(nom),
            unite_article:unites_catalogue(nom)
          `)
          .order('nom', { ascending: true });
        
        if (error) {
          console.error('❌ Erreur catalogue optimisé:', error);
          toast({
            title: "Erreur de chargement",
            description: `Impossible de charger le catalogue: ${error.message}`,
            variant: "destructive",
          });
          throw error;
        }
        
        console.log('✅ Catalogue optimisé chargé:', data?.length, 'articles');
        console.log('📊 Premiers articles:', data?.slice(0, 3));
        
        return data as ArticleOptimized[];
      } catch (err) {
        console.error('❌ Exception catalogue optimisé:', err);
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1500
  });

  const forceRefresh = async () => {
    console.log('🔄 Force refresh catalogue...');
    await queryClient.invalidateQueries({ queryKey: ['catalogue-optimized'] });
    await refetch();
    
    toast({
      title: "Actualisation terminée",
      description: "Le catalogue a été rechargé avec succès",
    });
  };

  return {
    articles,
    isLoading,
    error,
    refetch,
    forceRefresh
  };
};
