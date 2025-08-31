
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockPrincipal {
  id: string;
  article_id: string;
  entrepot_id: string;
  quantite_disponible: number;
  quantite_reservee: number;
  derniere_entree?: string;
  created_at: string;
  updated_at: string;
  article?: {
    id: string;
    nom: string;
    reference: string;
    prix_achat?: number;
    prix_vente?: number;
    prix_unitaire?: number;
    description?: string;
    statut?: string;
    seuil_alerte?: number;
    categorie?: string;
    unite_mesure?: string;
    categorie_article?: {
      nom: string;
      couleur: string;
    };
    unite_article?: {
      nom: string;
      symbole: string;
    };
  };
  entrepot?: {
    id: string;
    nom: string;
    adresse?: string;
    statut?: string;
  };
}

export const useStockPrincipal = () => {
  const query = useQuery({
    queryKey: ['stock-principal'],
    queryFn: async () => {
      console.log('📦 Récupération du stock principal...');
      
      const { data, error } = await supabase
        .from('stock_principal')
        .select(`
          id,
          article_id,
          entrepot_id,
          quantite_disponible,
          quantite_reservee,
          derniere_entree,
          created_at,
          updated_at,
          article:catalogue!stock_principal_article_id_fkey(
            id,
            nom,
            reference,
            prix_achat,
            prix_vente,
            prix_unitaire,
            description,
            statut,
            seuil_alerte,
            categorie,
            unite_mesure,
            categorie_article:categories_catalogue!catalogue_categorie_id_fkey(nom, couleur)
          ),
          entrepot:entrepots!stock_principal_entrepot_id_fkey(
            id,
            nom,
            adresse,
            statut
          )
        `)
        .gt('quantite_disponible', 0)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération du stock principal:', error);
        throw error;
      }

      // Normaliser les données pour s'assurer de la compatibilité des types
      const normalizedData = (data || []).map(item => ({
        ...item,
        article: item.article ? {
          ...item.article,
          unite_article: { nom: item.article.unite_mesure || '', symbole: '' }
        } : undefined
      }));

      console.log('✅ Stock principal récupéré:', normalizedData?.length, 'entrées');
      return normalizedData as StockPrincipal[];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  return {
    ...query,
    stockEntrepot: query.data || [],
    refreshStock: query.refetch
  };
};

export const useUpdateStockPrincipal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, quantite_disponible, quantite_reservee }: { 
      id: string; 
      quantite_disponible?: number; 
      quantite_reservee?: number; 
    }) => {
      const updateData: any = {};
      if (quantite_disponible !== undefined) updateData.quantite_disponible = quantite_disponible;
      if (quantite_reservee !== undefined) updateData.quantite_reservee = quantite_reservee;
      
      const { data, error } = await supabase
        .from('stock_principal')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
    }
  });
};
