
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockPointDeVente {
  id: string;
  article_id: string;
  point_vente_id: string;
  quantite_disponible: number;
  derniere_livraison?: string;
  created_at: string;
  updated_at: string;
  article?: {
    id: string;
    nom: string;
    reference: string;
    prix_vente?: number;
    statut?: string;
    categorie_article?: {
      nom: string;
      couleur: string;
    };
    unite_article?: {
      nom: string;
      symbole: string;
    };
  };
  point_vente?: {
    id: string;
    nom: string;
    type_pdv?: string;
    statut?: string;
  };
}

export const useStockPDV = (pointVenteId?: string) => {
  const query = useQuery({
    queryKey: ['stock-pdv', pointVenteId],
    queryFn: async () => {
      console.log('🏪 Récupération du stock PDV...');
      
      let queryBuilder = supabase
        .from('stock_pdv')
        .select(`
          id,
          article_id,
          point_vente_id,
          quantite_disponible,
          derniere_livraison,
          created_at,
          updated_at,
          article:catalogue!stock_pdv_article_id_fkey(
            id,
            nom,
            reference,
            prix_vente,
            statut,
            categorie_article:categories_catalogue!catalogue_categorie_id_fkey(nom, couleur)
          ),
          point_vente:points_de_vente!stock_pdv_point_vente_id_fkey(
            id,
            nom,
            type_pdv,
            statut
          )
        `)
        .gt('quantite_disponible', 0);

      if (pointVenteId) {
        queryBuilder = queryBuilder.eq('point_vente_id', pointVenteId);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération du stock PDV:', error);
        throw error;
      }

      // Normaliser les données pour s'assurer de la compatibilité des types
      const normalizedData = (data || []).map(item => ({
        ...item,
        article: item.article ? {
          ...item.article,
          unite_article: { nom: '', symbole: '' }
        } : undefined
      }));

      console.log('✅ Stock PDV récupéré:', normalizedData?.length, 'entrées');
      return normalizedData as StockPointDeVente[];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !pointVenteId || !!pointVenteId
  });

  return {
    ...query,
    stockPDV: query.data || []
  };
};

export const useUpdateStockPDV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, quantite_disponible }: { 
      id: string; 
      quantite_disponible: number; 
    }) => {
      const { data, error } = await supabase
        .from('stock_pdv')
        .update({ quantite_disponible })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
    }
  });
};
