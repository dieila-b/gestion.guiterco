
import { supabase } from '@/integrations/supabase/client';
import type { CreateFactureVenteData } from '../types';

export const updateStockPDV = async (data: CreateFactureVenteData, facture: any) => {
  let pointVenteId = data.point_vente_id!;
  
  console.log('📦 DÉBUT mise à jour stock PDV DÉFINITIVE pour:', pointVenteId);
  
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
      throw new Error(`Point de vente non trouvé: ${data.point_vente_id}`);
    } else {
      pointVenteId = pdvData.id;
      console.log('✅ ID point de vente trouvé:', pointVenteId);
    }
  }

  // Traitement article par article avec gestion d'erreur individuelle
  const resultats = [];
  
  for (const item of data.cart) {
    console.log(`🔄 TRAITEMENT article ${item.article_id}, quantité à déduire: ${item.quantite}`);
    
    try {
      // Vérifier le stock actuel AVANT déduction
      const { data: stockExistant, error: stockCheckError } = await supabase
        .from('stock_pdv')
        .select('id, quantite_disponible, article_id, point_vente_id')
        .eq('article_id', item.article_id)
        .eq('point_vente_id', pointVenteId)
        .maybeSingle();

      if (stockCheckError) {
        console.error('❌ Erreur vérification stock pour article:', item.article_id, stockCheckError);
        resultats.push({ article_id: item.article_id, success: false, error: 'Erreur vérification stock' });
        continue;
      }

      if (!stockExistant) {
        console.error(`❌ STOCK NON TROUVÉ pour article ${item.article_id} au PDV ${pointVenteId}`);
        resultats.push({ article_id: item.article_id, success: false, error: 'Stock non trouvé' });
        continue;
      }

      const stockAvant = stockExistant.quantite_disponible;
      const nouvelleQuantite = Math.max(0, stockAvant - item.quantite);
      
      console.log(`📊 CALCUL STOCK - Article: ${item.article_id}`);
      console.log(`📊 Stock avant: ${stockAvant}, Quantité vendue: ${item.quantite}, Stock après: ${nouvelleQuantite}`);

      // MISE À JOUR DÉFINITIVE DU STOCK
      const { data: stockUpdate, error: updateError } = await supabase
        .from('stock_pdv')
        .update({
          quantite_disponible: nouvelleQuantite,
          updated_at: new Date().toISOString()
        })
        .eq('id', stockExistant.id)
        .select();

      if (updateError) {
        console.error('❌ ERREUR CRITIQUE - Échec mise à jour stock pour article:', item.article_id, updateError);
        resultats.push({ article_id: item.article_id, success: false, error: updateError.message });
      } else {
        console.log(`✅ STOCK MIS À JOUR DÉFINITIVEMENT pour article ${item.article_id}: ${stockAvant} → ${nouvelleQuantite}`);
        resultats.push({ 
          article_id: item.article_id, 
          success: true, 
          stock_avant: stockAvant, 
          stock_apres: nouvelleQuantite,
          quantite_deduite: item.quantite
        });

        // Créer une entrée dans les sorties de stock pour traçabilité
        try {
          await supabase
            .from('sorties_stock')
            .insert({
              article_id: item.article_id,
              quantite: item.quantite,
              type_sortie: 'vente',
              destination: `PDV ${pointVenteId}`,
              numero_bon: facture.numero_facture,
              observations: `Vente facture ${facture.numero_facture} - Déduction automatique stock PDV`,
              created_by: 'system'
            });
          
          console.log(`📝 Sortie de stock créée pour traçabilité - Article: ${item.article_id}`);
        } catch (sortieError) {
          console.warn('⚠️ Erreur création sortie stock (non bloquant):', sortieError);
        }
      }
      
    } catch (error) {
      console.error(`❌ Erreur générale pour article ${item.article_id}:`, error);
      resultats.push({ article_id: item.article_id, success: false, error: error.message });
    }
  }
  
  // Résumé des résultats
  const reussites = resultats.filter(r => r.success).length;
  const echecs = resultats.filter(r => !r.success).length;
  
  console.log(`📊 RÉSUMÉ MISE À JOUR STOCK PDV:`);
  console.log(`✅ Réussites: ${reussites}/${data.cart.length}`);
  console.log(`❌ Échecs: ${echecs}/${data.cart.length}`);
  
  if (echecs > 0) {
    console.error('❌ CERTAINS STOCKS N\'ONT PAS PU ÊTRE MIS À JOUR:', 
      resultats.filter(r => !r.success).map(r => ({ article: r.article_id, erreur: r.error }))
    );
  }
  
  console.log('🎯 MISE À JOUR STOCK PDV TERMINÉE');
  return resultats;
};
