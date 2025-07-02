
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
      throw new Error(`Point de vente "${data.point_vente_id}" non trouvé`);
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
      throw new Error(`Erreur lors de la vérification du stock pour l'article ${item.article_id}`);
    }

    if (stockExistant) {
      // Vérifier si on a assez de stock
      if (stockExistant.quantite_disponible < item.quantite) {
        throw new Error(`Stock insuffisant pour l'article ${item.article_id}. Disponible: ${stockExistant.quantite_disponible}, Demandé: ${item.quantite}`);
      }

      const nouvelleQuantite = stockExistant.quantite_disponible - item.quantite;
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
        throw new Error(`Impossible de mettre à jour le stock pour l'article ${item.article_id}: ${updateError.message}`);
      } else {
        console.log(`✅ Stock mis à jour avec succès pour article ${item.article_id}: ${stockExistant.quantite_disponible} → ${nouvelleQuantite}`);
      }

      // Créer une sortie de stock pour traçabilité
      const { error: sortieError } = await supabase
        .from('sorties_stock')
        .insert({
          article_id: item.article_id,
          point_vente_id: null, // Pas d'entrepôt source pour les sorties PDV
          quantite: item.quantite,
          type_sortie: 'vente',
          numero_bon: facture.numero_facture,
          destination: 'Client',
          observations: `Vente facture ${facture.numero_facture} - PDV: ${pointVenteId}`,
          created_by: 'system'
        });

      if (sortieError) {
        console.warn('⚠️ Impossible de créer l\'entrée de sortie de stock:', sortieError);
        // Ne pas faire échouer la vente pour cela
      }
    } else {
      console.log(`⚠️ ATTENTION - Aucun stock trouvé pour l'article ${item.article_id} au PDV ${pointVenteId}`);
      throw new Error(`Stock non trouvé pour l'article ${item.article_id} au point de vente`);
    }
  }
  
  console.log('✅ Mise à jour stock PDV terminée avec succès');
};
