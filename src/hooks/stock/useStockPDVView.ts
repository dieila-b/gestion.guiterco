
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
      
      // Requête simplifiée sans relations complexes
      const { data: stockData, error } = await supabase
        .from('stock_pdv')
        .select(`
          id,
          article_id,
          point_vente_id,
          quantite_disponible,
          quantite_minimum,
          derniere_livraison
        `)
        .gt('quantite_disponible', 0);

      if (error) {
        console.error('❌ Erreur lors de la récupération du stock PDV:', error);
        throw error;
      }

      if (!stockData || stockData.length === 0) {
        console.log('ℹ️ Aucun stock PDV trouvé');
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

      // Récupérer les points de vente séparément
      const pdvIds = [...new Set(stockData.map(item => item.point_vente_id))];
      const { data: pointsDeVente, error: pdvError } = await supabase
        .from('points_de_vente')
        .select('id, nom, type_pdv, adresse')
        .in('id', pdvIds);

      if (pdvError) {
        console.error('❌ Erreur lors de la récupération des points de vente:', pdvError);
        throw pdvError;
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
      const transformedData: StockPDVView[] = stockData.map(stock => {
        const article = articles?.find(a => a.id === stock.article_id);
        const pdv = pointsDeVente?.find(p => p.id === stock.point_vente_id);
        const categorie = categories.find(c => c.id === article?.categorie_id);
        const unite = unites.find(u => u.id === article?.unite_id);

        const prix = article?.prix_vente || article?.prix_unitaire || 0;
        const valeurTotale = stock.quantite_disponible * prix;

        return {
          id: stock.id,
          article_id: stock.article_id,
          point_vente_id: stock.point_vente_id,
          quantite_disponible: stock.quantite_disponible,
          quantite_minimum: stock.quantite_minimum,
          derniere_livraison: stock.derniere_livraison,
          article_nom: article?.nom || 'Article inconnu',
          reference: article?.reference || '',
          prix_vente: article?.prix_vente,
          prix_achat: article?.prix_achat,
          prix_unitaire: article?.prix_unitaire,
          pdv_nom: pdv?.nom || 'PDV inconnu',
          type_pdv: pdv?.type_pdv,
          pdv_adresse: pdv?.adresse,
          valeur_totale: valeurTotale,
          categorie_nom: categorie?.nom || null,
          categorie_couleur: categorie?.couleur || null,
          unite_nom: unite?.nom || null,
          unite_symbole: unite?.symbole || null,
        };
      });

      console.log('✅ Stock PDV transformé:', transformedData.length, 'entrées');
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
      // Statistiques simples
      const { data: stockData, error } = await supabase
        .from('stock_pdv')
        .select('quantite_disponible, article_id')
        .gt('quantite_disponible', 0);
      
      if (error) {
        console.error('❌ Erreur lors de la récupération des stats PDV:', error);
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

      const pdvActifs = new Set(stockData?.map(item => item.point_vente_id)).size;
      
      return { 
        total_articles: totalArticles, 
        valeur_totale: valeurTotale, 
        pdv_actifs: pdvActifs 
      };
    },
    staleTime: 2 * 60 * 1000
  });
};
