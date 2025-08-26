
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
      return data || [];
    }
  });

  // Hook pour récupérer le stock PDV avec filtrage par point de vente et relations complètes
  const { data: stockPDV } = useQuery({
    queryKey: ['stock_pdv', selectedPDV],
    queryFn: async () => {
      if (!selectedPDV) return [];
      
      console.log('Fetching stock for PDV:', selectedPDV);
      console.log('Available PDVs:', pointsDeVente);
      
      // Trouver l'ID du point de vente sélectionné
      const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === selectedPDV);
      if (!pdvSelected) {
        console.log('PDV not found:', selectedPDV);
        return [];
      }
      
      console.log('PDV selected:', pdvSelected);
      
      // Requête simplifiée avec join manuel
      const { data: stockData, error: stockError } = await supabase
        .from('stock_pdv')
        .select(`
          *,
          catalogue!inner(
            id, 
            nom, 
            prix_vente, 
            reference, 
            image_url, 
            categorie,
            categorie_id,
            unite_mesure
          )
        `)
        .eq('point_vente_id', pdvSelected.id)
        .gt('quantite_disponible', 0);
      
      if (stockError) {
        console.error('Error fetching stock:', stockError);
        throw stockError;
      }
      
      console.log('Stock data loaded:', stockData);
      
      // Normaliser les données avec structure simplifiée
      const normalizedData = stockData?.map(item => ({
        ...item,
        article: {
          ...item.catalogue,
          // Structure cohérente pour l'affichage
          categorie_article: item.catalogue.categorie ? { nom: item.catalogue.categorie } : null
        }
      })) || [];
      
      console.log('Normalized stock data:', normalizedData);
      return normalizedData;
    },
    enabled: !!selectedPDV && !!pointsDeVente
  });

  return {
    pointsDeVente: pointsDeVente || [],
    stockPDV: stockPDV || []
  };
};
