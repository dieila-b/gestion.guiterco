
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

// Nouvelle fonction pour mettre à jour le stock après une vente
export const updateStockAfterVente = async (cart: any[], selectedPDV: string, pdvNom: string) => {
  console.log('🔄 Mise à jour stock après vente pour PDV:', pdvNom);
  
  for (const item of cart) {
    try {
      // Récupérer le stock actuel
      const { data: currentStock, error: fetchError } = await supabase
        .from('stock_pdv')
        .select('quantite_disponible')
        .eq('article_id', item.article_id)
        .eq('point_vente_id', selectedPDV)
        .single();

      if (fetchError) {
        console.error('Erreur récupération stock pour article:', item.article_id, fetchError);
        continue; // Continue avec les autres articles
      }

      // Calculer la nouvelle quantité
      const newQuantity = Math.max(0, currentStock.quantite_disponible - item.quantite);

      // Mettre à jour le stock
      const { error: updateError } = await supabase
        .from('stock_pdv')
        .update({
          quantite_disponible: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('article_id', item.article_id)
        .eq('point_vente_id', selectedPDV);

      if (updateError) {
        console.error('Erreur mise à jour stock pour article:', item.article_id, updateError);
      } else {
        console.log('✅ Stock mis à jour:', {
          article_id: item.article_id,
          ancienne_quantite: currentStock.quantite_disponible,
          nouvelle_quantite: newQuantity,
          quantite_vendue: item.quantite
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
    }
  }
};
