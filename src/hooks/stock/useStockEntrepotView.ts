
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
      
      // Requête simplifiée sans relations complexes
      const { data: stockData, error } = await supabase
        .from('stock_principal')
        .select(`
          id,
          article_id,
          entrepot_id,
          quantite_disponible,
          quantite_reservee,
          derniere_entree
        `)
        .gt('quantite_disponible', 0);

      if (error) {
        console.error('❌ Erreur lors de la récupération du stock principal:', error);
        throw error;
      }

      if (!stockData || stockData.length === 0) {
        console.log('ℹ️ Aucun stock principal trouvé');
        return [];
      }

      // Récupérer les articles séparément
      const articleIds = [...new Set(stockData.map(item => item.article_id))];
      const { data: articles, error: articlesError } = await supabase
        .from('catalogue')
        .select('id, nom, reference, prix_vente, prix_achat, prix_unitaire, categorie_id, unite_id')
        .in('id', articleIds);

      if (articlesError) {
        console.error('❌ Erreur lors de la récupération des articles:', articlesError);
        throw articlesError;
      }

      // Récupérer les entrepôts séparément
      const entrepotIds = [...new Set(stockData.map(item => item.entrepot_id))];
      const { data: entrepots, error: entrepotsError } = await supabase
        .from('entrepots')
        .select('id, nom, adresse')
        .in('id', entrepotIds);

      if (entrepotsError) {
        console.error('❌ Erreur lors de la récupération des entrepôts:', entrepotsError);
        throw entrepotsError;
      }

      // Récupérer les catégories si nécessaire
      const categorieIds = articles?.filter(a => a.categorie_id).map(a => a.categorie_id) || [];
      let categories: any[] = [];
      if (categorieIds.length > 0) {
        const { data: categoriesData } = await supabase
          .from('categories_catalogue')
          .select('id, nom, couleur')
          .in('id', categorieIds);
        categories = categoriesData || [];
      }

      // Récupérer les unités si nécessaire
      const uniteIds = articles?.filter(a => a.unite_id).map(a => a.unite_id) || [];
      let unites: any[] = [];
      if (uniteIds.length > 0) {
        const { data: unitesData } = await supabase
          .from('unites')
          .select('id, nom, symbole')
          .in('id', uniteIds);
        unites = unitesData || [];
      }

      // Assembler les données
      const transformedData: StockEntrepotView[] = stockData.map(stock => {
        const article = articles?.find(a => a.id === stock.article_id);
        const entrepot = entrepots?.find(e => e.id === stock.entrepot_id);
        const categorie = categories.find(c => c.id === article?.categorie_id);
        const unite = unites.find(u => u.id === article?.unite_id);

        const prix = article?.prix_vente || article?.prix_unitaire || 0;
        const valeurTotale = stock.quantite_disponible * prix;

        return {
          id: stock.id,
          article_id: stock.article_id,
          entrepot_id: stock.entrepot_id,
          quantite_disponible: stock.quantite_disponible,
          quantite_reservee: stock.quantite_reservee || 0,
          derniere_entree: stock.derniere_entree,
          article_nom: article?.nom || 'Article inconnu',
          reference: article?.reference || '',
          prix_vente: article?.prix_vente,
          prix_achat: article?.prix_achat,
          prix_unitaire: article?.prix_unitaire,
          entrepot_nom: entrepot?.nom || 'Entrepôt inconnu',
          entrepot_adresse: entrepot?.adresse,
          valeur_totale: valeurTotale,
          categorie_nom: categorie?.nom || null,
          categorie_couleur: categorie?.couleur || null,
          unite_nom: unite?.nom || null,
          unite_symbole: unite?.symbole || null,
        };
      });

      console.log('✅ Stock entrepôt transformé:', transformedData.length, 'entrées');
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
      // Statistiques simples
      const { data: stockData, error } = await supabase
        .from('stock_principal')
        .select('quantite_disponible, article_id')
        .gt('quantite_disponible', 0);
      
      if (error) {
        console.error('❌ Erreur lors de la récupération des stats entrepôt:', error);
        throw error;
      }

      const totalArticles = stockData?.length || 0;
      
      // Récupérer les prix des articles pour calculer la valeur
      const articleIds = [...new Set(stockData?.map(item => item.article_id) || [])];
      let valeurTotale = 0;
      
      if (articleIds.length > 0) {
        const { data: articles } = await supabase
          .from('catalogue')
          .select('id, prix_vente, prix_unitaire')
          .in('id', articleIds);

        valeurTotale = stockData?.reduce((sum, stock) => {
          const article = articles?.find(a => a.id === stock.article_id);
          const prix = article?.prix_vente || article?.prix_unitaire || 0;
          return sum + (stock.quantite_disponible * prix);
        }, 0) || 0;
      }

      const entrepotsActifs = new Set(stockData?.map(item => item.entrepot_id)).size;
      
      return { 
        total_articles: totalArticles, 
        valeur_totale: valeurTotale, 
        entrepots_actifs: entrepotsActifs 
      };
    },
    staleTime: 2 * 60 * 1000
  });
};
