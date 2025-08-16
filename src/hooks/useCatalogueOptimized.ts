
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
  categorie_article?: { nom: string } | null;
  unite_article?: { nom: string } | null;
}

export const useCatalogueOptimized = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading, error, refetch } = useQuery({
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
            categorie_article:categories_catalogue(nom)
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
        
        // Nettoyer les données pour éviter les erreurs de relation
        const cleanedData = (data || []).map(article => ({
          ...article,
          categorie_article: article.categorie_article && typeof article.categorie_article === 'object' && 'nom' in article.categorie_article 
            ? article.categorie_article 
            : null,
          unite_article: null // Pas de relation unite_article disponible dans la DB
        }));
        
        return cleanedData as ArticleOptimized[];
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

  // Extraire les catégories uniques - gérer les valeurs nulles
  const categories = Array.from(new Set(
    articles
      .map(article => {
        const categoryName = article.categorie || (article.categorie_article?.nom);
        return categoryName || '';
      })
      .filter(Boolean)
  )) as string[];

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
    categories,
    isLoading,
    error,
    refetch,
    forceRefresh
  };
};
