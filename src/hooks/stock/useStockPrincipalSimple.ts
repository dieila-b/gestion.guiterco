import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStockPrincipalSimple = () => {
  const { data: stockEntrepot, isLoading, error } = useQuery({
    queryKey: ['stock-principal-simple'],
    queryFn: async () => {
      console.log('Fetching stock principal data with simple queries...');
      
      // Première requête: récupérer les données de stock
      const { data: stockData, error: stockError } = await supabase
        .from('stock_principal')
        .select(`
          id,
          article_id,
          entrepot_id,
          quantite_disponible,
          quantite_reservee,
          emplacement,
          derniere_entree,
          derniere_sortie,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false });

      if (stockError) {
        console.error('Erreur lors du chargement du stock:', stockError);
        throw stockError;
      }

      if (!stockData || stockData.length === 0) {
        console.log('Aucun stock trouvé');
        return [];
      }

      // Récupérer les articles
      const articleIds = [...new Set(stockData.map(s => s.article_id).filter(Boolean))];
      const { data: articles } = await supabase
        .from('catalogue')
        .select(`
          id,
          reference,
          nom,
          description,
          categorie,
          unite_mesure,
          prix_unitaire,
          prix_achat,
          prix_vente,
          statut,
          seuil_alerte,
          created_at,
          updated_at
        `)
        .in('id', articleIds);

      // Récupérer les entrepôts
      const entrepotIds = [...new Set(stockData.map(s => s.entrepot_id).filter(Boolean))];
      const { data: entrepots } = await supabase
        .from('entrepots')
        .select(`
          id,
          nom,
          adresse,
          gestionnaire,
          statut,
          capacite_max,
          created_at,
          updated_at
        `)
        .in('id', entrepotIds);

      // Récupérer les catégories
      const { data: categories } = await supabase
        .from('categories_catalogue')
        .select('id, nom');

      // Récupérer les unités
      const { data: unites } = await supabase
        .from('unites')
        .select('id, nom');

      // Mapper les données
      const articlesMap = new Map(articles?.map(a => [a.id, a]) || []);
      const entrepotsMap = new Map(entrepots?.map(e => [e.id, e]) || []);
      const categoriesMap = new Map(categories?.map(c => [c.id, c]) || []);
      const unitesMap = new Map(unites?.map(u => [u.id, u]) || []);

      const result = stockData.map(stock => {
        const article = articlesMap.get(stock.article_id);
        const entrepot = entrepotsMap.get(stock.entrepot_id);

        return {
          ...stock,
          article: article ? {
            ...article,
            categorie_article: article.categorie ? categoriesMap.get(article.categorie) : null,
            unite_article: article.unite_mesure ? unitesMap.get(article.unite_mesure) : null
          } : null,
          entrepot
        };
      });

      console.log('Stock data loaded successfully:', result.length, 'items');
      return result;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    stockEntrepot,
    isLoading,
    error
  };
};