
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStockPrincipalOptimized = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stockEntrepot, isLoading, error } = useQuery({
    queryKey: ['stock-principal-optimized'],
    queryFn: async () => {
      console.log('🔄 Fetching optimized stock principal...');
      
      try {
        const { data, error } = await supabase
          .from('stock_principal')
          .select(`
            id,
            quantite_disponible,
            derniere_entree,
            created_at,
            updated_at,
            article:catalogue!inner(
              id,
              nom,
              reference,
              prix_achat,
              prix_unitaire,
              categorie,
              unite_mesure,
              categorie_id,
              unite_id,
              statut,
              seuil_alerte,
              categorie_article:categories_catalogue(nom),
              unite_article:unites_catalogue(nom)
            ),
            entrepot:entrepots!inner(
              id,
              nom,
              statut
            )
          `)
          .gt('quantite_disponible', 0)
          .order('article(nom)', { ascending: true });
        
        if (error) {
          console.error('❌ Erreur stock principal:', error);
          throw error;
        }
        
        console.log('✅ Stock principal chargé:', data?.length, 'entrées');
        return data || [];
      } catch (err) {
        console.error('❌ Exception stock principal:', err);
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2
  });

  const forceRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['stock-principal-optimized'] });
    toast({
      title: "Stock actualisé",
      description: "Les données de stock ont été rechargées",
    });
  };

  return {
    stockEntrepot,
    isLoading,
    error,
    forceRefresh
  };
};

export const useStockPDVOptimized = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stockPDV, isLoading } = useQuery({
    queryKey: ['stock-pdv-optimized'],
    queryFn: async () => {
      console.log('🔄 Fetching optimized stock PDV...');
      
      try {
        const { data, error } = await supabase
          .from('stock_pdv')
          .select(`
            id,
            quantite_disponible,
            derniere_livraison,
            created_at,
            updated_at,
            article:catalogue!inner(
              id,
              nom,
              reference,
              prix_vente,
              prix_unitaire,
              categorie,
              unite_mesure,
              statut,
              categorie_article:categories_catalogue(nom),
              unite_article:unites_catalogue(nom)
            ),
            point_vente:points_de_vente!inner(
              id,
              nom,
              statut
            )
          `)
          .gt('quantite_disponible', 0)
          .order('article(nom)', { ascending: true });
        
        if (error) {
          console.error('❌ Erreur stock PDV:', error);
          throw error;
        }
        
        console.log('✅ Stock PDV chargé:', data?.length, 'entrées');
        return data || [];
      } catch (err) {
        console.error('❌ Exception stock PDV:', err);
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2
  });

  const forceRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['stock-pdv-optimized'] });
    toast({
      title: "Stock PDV actualisé",
      description: "Les données de stock PDV ont été rechargées",
    });
  };

  return {
    stockPDV,
    isLoading,
    forceRefresh
  };
};
