
import { supabase } from '@/integrations/supabase/client';

// Service for managing stock updates
export const updateStockPDV = async (venteData: any, pdvSelected: any) => {
  for (const article of venteData.articles) {
    // Récupérer d'abord la quantité actuelle
    const { data: currentStock, error: fetchError } = await supabase
      .from('stock_pdv')
      .select('quantite_disponible')
      .eq('article_id', article.id)
      .eq('point_vente_id', pdvSelected.id)
      .single();

    if (fetchError) {
      console.error('Erreur récupération stock:', fetchError);
      throw fetchError;
    }

    // Calculer la nouvelle quantité
    const newQuantity = Math.max(0, currentStock.quantite_disponible - article.quantite);

    // Mettre à jour le stock
    const { error: stockError } = await supabase
      .from('stock_pdv')
      .update({
        quantite_disponible: newQuantity
      })
      .eq('article_id', article.id)
      .eq('point_vente_id', pdvSelected.id);

    if (stockError) {
      console.error('Erreur mise à jour stock:', stockError);
      throw stockError;
    }
  }
};
