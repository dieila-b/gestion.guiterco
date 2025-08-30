
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockEntrepotView {
  id: string;
  article_id: string;
  entrepot_id: string;
  quantite_disponible: number;
  quantite_reservee: number;
  derniere_entree: string | null;
  article_nom: string;
  reference: string;
  prix_vente: number | null;
  prix_achat: number | null;
  prix_unitaire: number | null;
  entrepot_nom: string;
  entrepot_adresse: string | null;
  valeur_totale: number;
  categorie_nom: string | null;
  categorie_couleur: string | null;
  unite_nom: string | null;
  unite_symbole: string | null;
}

export const useStockEntrepotView = () => {
  return useQuery({
    queryKey: ['stock-entrepot-view'],
    queryFn: async () => {
      console.log('🏭 Récupération du stock entrepôt...');
      
      const { data, error } = await supabase
        .from('stock_principal')
        .select(`
          id,
          article_id,
          entrepot_id,
          quantite_disponible,
          quantite_reservee,
          derniere_entree,
          catalogue!inner (
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
          entrepots!inner (
            nom,
            adresse
          )
        `)
        .gt('quantite_disponible', 0)
        .order('entrepots.nom', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération du stock entrepôt:', error);
        throw error;
      }

      console.log('✅ Stock entrepôt récupéré:', data?.length, 'entrées');
      
      // Transformation des données pour correspondre à l'interface
      const transformedData: StockEntrepotView[] = data?.map(item => ({
        id: item.id,
        article_id: item.article_id,
        entrepot_id: item.entrepot_id,
        quantite_disponible: item.quantite_disponible,
        quantite_reservee: item.quantite_reservee || 0,
        derniere_entree: item.derniere_entree,
        article_nom: item.catalogue?.nom || '',
        reference: item.catalogue?.reference || '',
        prix_vente: item.catalogue?.prix_vente,
        prix_achat: item.catalogue?.prix_achat,
        prix_unitaire: item.catalogue?.prix_unitaire,
        entrepot_nom: item.entrepots?.nom || '',
        entrepot_adresse: item.entrepots?.adresse,
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

export const useStockEntrepotStats = () => {
  return useQuery({
    queryKey: ['stock-entrepot-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_principal')
        .select(`
          quantite_disponible,
          entrepot_id,
          catalogue!inner (
            prix_vente,
            prix_unitaire
          )
        `)
        .gt('quantite_disponible', 0);
      
      if (error) {
        console.error('❌ Erreur lors de la récupération des stats entrepôt:', error);
        throw error;
      }
      
      const totalArticles = data?.length || 0;
      const valeurTotale = data?.reduce((sum, item) => {
        const prix = item.catalogue?.prix_vente || item.catalogue?.prix_unitaire || 0;
        return sum + (item.quantite_disponible * prix);
      }, 0) || 0;
      const entrepotsActifs = new Set(data?.map(item => item.entrepot_id)).size;
      
      return { 
        total_articles: totalArticles, 
        valeur_totale: valeurTotale, 
        entrepots_actifs: entrepotsActifs 
      };
    },
    staleTime: 2 * 60 * 1000
  });
};
