
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStockQueries = (selectedPDV?: string) => {
  // Hook pour récupérer les points de vente
  const { data: pointsDeVente } = useQuery({
    queryKey: ['points_de_vente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .select('*')
        .eq('statut', 'actif');
      
      if (error) throw error;
      return data;
    }
  });

  // Hook pour récupérer le stock PDV avec filtrage par point de vente
  const { data: stockPDV } = useQuery({
    queryKey: ['stock_pdv', selectedPDV],
    queryFn: async () => {
      if (!selectedPDV) return [];
      
      // Trouver l'ID du point de vente sélectionné
      const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === selectedPDV);
      if (!pdvSelected) return [];
      
      const { data, error } = await supabase
        .from('stock_pdv')
        .select(`
          *,
          article:catalogue!inner(id, nom, prix_vente, reference, image_url, categorie),
          point_vente:points_de_vente!inner(nom)
        `)
        .eq('point_vente_id', pdvSelected.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPDV && !!pointsDeVente
  });

  return {
    pointsDeVente,
    stockPDV
  };
};
