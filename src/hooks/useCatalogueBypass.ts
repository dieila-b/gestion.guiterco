
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ArticleBypass {
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
  created_at?: string;
  updated_at?: string;
}

export const useCatalogueBypass = () => {
  const { toast } = useToast();

  const { data: articles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['catalogue-bypass'],
    queryFn: async () => {
      console.log('🔄 Fetching catalogue with multiple strategies...');
      
      let lastError: any = null;
      
      // Stratégie 1: Requête ultra-simple
      try {
        console.log('📝 Stratégie 1: Requête ultra-simple');
        const { data, error } = await supabase
          .from('catalogue')
          .select('id, nom, reference, prix_achat, prix_vente, categorie, statut');
        
        if (!error && data && data.length > 0) {
          console.log('✅ Stratégie 1 réussie:', data.length, 'articles');
          return data as ArticleBypass[];
        }
        lastError = error;
      } catch (err) {
        console.log('❌ Stratégie 1 échouée:', err);
        lastError = err;
      }

      // Stratégie 2: Requête complète traditionnelle
      try {
        console.log('📝 Stratégie 2: Requête complète');
        const { data, error } = await supabase
          .from('catalogue')
          .select('*')
          .order('nom', { ascending: true });
        
        if (!error && data && data.length > 0) {
          console.log('✅ Stratégie 2 réussie:', data.length, 'articles');
          return data as ArticleBypass[];
        }
        lastError = error;
      } catch (err) {
        console.log('❌ Stratégie 2 échouée:', err);
        lastError = err;
      }

      // Stratégie 3: Requête avec relations (comme avant)
      try {
        console.log('📝 Stratégie 3: Avec relations');
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
        
        if (!error && data && data.length > 0) {
          console.log('✅ Stratégie 3 réussie:', data.length, 'articles');
          return data as ArticleBypass[];
        }
        lastError = error;
      } catch (err) {
        console.log('❌ Stratégie 3 échouée:', err);
        lastError = err;
      }

      // Si toutes les stratégies échouent
      console.error('❌ Toutes les stratégies ont échoué. Dernière erreur:', lastError);
      throw lastError || new Error('Impossible de récupérer les données du catalogue');
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      console.log(`Tentative ${failureCount + 1}/3:`, error);
      return failureCount < 2;
    },
    retryDelay: 1000
  });

  const forceRefresh = async () => {
    console.log('🔄 Force refresh catalogue bypass...');
    try {
      await refetch();
      toast({
        title: "Actualisation terminée",
        description: "Le catalogue a été rechargé avec la méthode de contournement",
      });
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
      toast({
        title: "Erreur d'actualisation",
        description: "Impossible de recharger le catalogue",
        variant: "destructive"
      });
    }
  };

  return {
    articles,
    isLoading,
    error,
    refetch,
    forceRefresh
  };
};
