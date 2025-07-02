
import { supabase } from '@/integrations/supabase/client';
import type { CreateFactureVenteData } from '../types';

export const updateStockPDV = async (data: CreateFactureVenteData, facture: any) => {
  let pointVenteId = data.point_vente_id!;
  
  console.log('📦 Début mise à jour stock PDV pour:', pointVenteId);
  
  // Vérifier si c'est déjà un UUID valide
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(data.point_vente_id!)) {
    console.log('🔍 Recherche ID du point de vente pour nom:', data.point_vente_id);
    
    const { data: pdvData, error: pdvError } = await supabase
      .from('points_de_vente')
      .select('id')
      .eq('nom', data.point_vente_id)
      .single();
    
    if (pdvError) {
      console.error('❌ Erreur récupération point de vente:', pdvError);
      return;
    } else {
      pointVenteId = pdvData.id;
      console.log('✅ ID point de vente trouvé:', pointVenteId);
    }
  }

  // Mettre à jour le stock pour chaque article
  for (const item of data.cart) {
    console.log(`🔄 Mise à jour stock pour article ${item.article_id}, quantité à déduire: ${item.quantite}`);
    
    // Vérifier le stock actuel
    const { data: stockExistant, error: stockCheckError } = await supabase
      .from('stock_pdv')
      .select('id, quantite_disponible')
      .eq('article_id', item.article_id)
      .eq('point_vente_id', pointVenteId)
      .maybeSingle();

    if (stockCheckError) {
      console.error('❌ Erreur vérification stock:', stockCheckError);
      continue;
    }

    if (stockExistant) {
      const nouvelleQuantite = Math.max(0, stockExistant.quantite_disponible - item.quantite);
      console.log(`📦 Stock avant: ${stockExistant.quantite_disponible}, après vente: ${nouvelleQuantite}`);

      const { error: updateError } = await supabase
        .from('stock_pdv')
        .update({
          quantite_disponible: nouvelleQuantite,
          updated_at: new Date().toISOString()
        })
        .eq('id', stockExistant.id);

      if (updateError) {
        console.error('❌ ERREUR CRITIQUE - Échec mise à jour stock:', updateError);
        throw new Error(`Impossible de mettre à jour le stock pour l'article ${item.article_id}`);
      } else {
        console.log(`✅ Stock mis à jour avec succès pour article ${item.article_id}: ${stockExistant.quantite_disponible} → ${nouvelleQuantite}`);
      }
    } else {
      console.log(`⚠️ ATTENTION - Aucun stock trouvé pour l'article ${item.article_id} au PDV ${pointVenteId}`);
      throw new Error(`Stock non trouvé pour l'article ${item.article_id} au point de vente`);
    }
  }
  
  console.log('✅ Mise à jour stock PDV terminée avec succès');
};
