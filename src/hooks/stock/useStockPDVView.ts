
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockPDVView {
  id: string;
  article_id: string;
  point_vente_id: string;
  quantite_disponible: number;
  quantite_minimum: number | null;
  derniere_livraison: string | null;
  article_nom: string;
  reference: string;
  prix_vente: number | null;
  prix_achat: number | null;
  prix_unitaire: number | null;
  pdv_nom: string;
  type_pdv: string | null;
  pdv_adresse: string | null;
  valeur_totale: number;
  categorie_nom: string | null;
  categorie_couleur: string | null;
  unite_nom: string | null;
  unite_symbole: string | null;
}

export const useStockPDVView = () => {
  return useQuery({
    queryKey: ['stock-pdv-view'],
    queryFn: async () => {
      console.log('🏪 Récupération du stock PDV...');
      
      const { data, error } = await supabase
        .from('stock_pdv')
        .select(`
          id,
          article_id,
          point_vente_id,
          quantite_disponible,
          quantite_minimum,
          derniere_livraison,
          catalogue!article_id (
            nom,
            reference,
            prix_vente,
            prix_achat,
            prix_unitaire,
            categories_catalogue (
              nom,
              couleur
            ),
            unites (
              nom,
              symbole
            )
          ),
          points_de_vente!point_vente_id (
            nom,
            type_pdv,
            adresse
          )
        `)
        .gt('quantite_disponible', 0)
        .order('points_de_vente.nom', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération du stock PDV:', error);
        throw error;
      }

      console.log('✅ Stock PDV récupéré:', data?.length, 'entrées');
      
      // Transformation des données pour correspondre à l'interface
      const transformedData: StockPDVView[] = data?.map(item => ({
        id: item.id,
        article_id: item.article_id,
        point_vente_id: item.point_vente_id,
        quantite_disponible: item.quantite_disponible,
        quantite_minimum: item.quantite_minimum,
        derniere_livraison: item.derniere_livraison,
        article_nom: item.catalogue?.nom || '',
        reference: item.catalogue?.reference || '',
        prix_vente: item.catalogue?.prix_vente,
        prix_achat: item.catalogue?.prix_achat,
        prix_unitaire: item.catalogue?.prix_unitaire,
        pdv_nom: item.points_de_vente?.nom || '',
        type_pdv: item.points_de_vente?.type_pdv,
        pdv_adresse: item.points_de_vente?.adresse,
        valeur_totale: item.quantite_disponible * (item.catalogue?.prix_vente || item.catalogue?.prix_unitaire || 0),
        categorie_nom: item.catalogue?.categories_catalogue?.nom || null,
        categorie_couleur: item.catalogue?.categories_catalogue?.couleur || null,
        unite_nom: item.catalogue?.unites?.nom || null,
        unite_symbole: item.catalogue?.unites?.symbole || null,
      })) || [];
      
      return transformedData;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

export const useStockPDVStats = () => {
  return useQuery({
    queryKey: ['stock-pdv-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_pdv')
        .select(`
          quantite_disponible,
          point_vente_id,
          catalogue!article_id (
            prix_vente,
            prix_unitaire
          )
        `)
        .gt('quantite_disponible', 0);
      
      if (error) {
        console.error('❌ Erreur lors de la récupération des stats PDV:', error);
        throw error;
      }
      
      const totalArticles = data?.length || 0;
      const valeurTotale = data?.reduce((sum, item) => {
        const prix = item.catalogue?.prix_vente || item.catalogue?.prix_unitaire || 0;
        return sum + (item.quantite_disponible * prix);
      }, 0) || 0;
      const pdvActifs = new Set(data?.map(item => item.point_vente_id)).size;
      
      return { 
        total_articles: totalArticles, 
        valeur_totale: valeurTotale, 
        pdv_actifs: pdvActifs 
      };
    },
    staleTime: 2 * 60 * 1000
  });
};
