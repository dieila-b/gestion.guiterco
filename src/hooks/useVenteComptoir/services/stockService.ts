
import { supabase } from '@/integrations/supabase/client';

// Service for managing stock updates - VERSION CORRIGÉE
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

// *** FONCTION CORRIGÉE POUR DÉCRÉMENTATION SYSTÉMATIQUE DU STOCK ***
export const updateStockAfterVente = async (cart: any[], selectedPDV: string, pdvNom: string) => {
  console.log('🔄 *** DÉCRÉMENTATION STOCK APRÈS VENTE OBLIGATOIRE ***');
  console.log('📦 Point de vente:', pdvNom, '- ID:', selectedPDV);
  console.log('🛒 Articles à traiter:', cart.length);
  
  if (!cart || cart.length === 0) {
    console.warn('⚠️ Panier vide, aucun stock à décrémenter');
    return;
  }

  if (!selectedPDV) {
    console.error('❌ Point de vente non spécifié, impossible de décrémenter le stock');
    throw new Error('Point de vente requis pour la mise à jour du stock');
  }

  const resultats = [];
  
  for (const item of cart) {
    console.log(`🔄 Traitement article ${item.article_id} - Quantité à déduire: ${item.quantite}`);
    
    try {
      // Récupérer le stock actuel AVANT déduction
      const { data: currentStock, error: fetchError } = await supabase
        .from('stock_pdv')
        .select('quantite_disponible, id')
        .eq('article_id', item.article_id)
        .eq('point_vente_id', selectedPDV)
        .single();

      if (fetchError) {
        console.error('❌ Erreur récupération stock pour article:', item.article_id, fetchError);
        
        // Si l'article n'existe pas dans le stock PDV, le créer avec quantité 0
        if (fetchError.code === 'PGRST116') {
          console.log('📦 Article non trouvé dans stock PDV, création avec quantité 0');
          const { error: insertError } = await supabase
            .from('stock_pdv')
            .insert({
              article_id: item.article_id,
              point_vente_id: selectedPDV,
              quantite_disponible: 0,
              derniere_livraison: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('❌ Erreur création stock PDV:', insertError);
            throw insertError;
          }
          
          resultats.push({ 
            article_id: item.article_id, 
            success: true, 
            stock_avant: 0, 
            stock_apres: 0,
            quantite_deduite: item.quantite,
            note: 'Article créé avec stock 0'
          });
          continue;
        }
        
        throw fetchError;
      }

      const stockAvant = currentStock.quantite_disponible;
      const nouvelleQuantite = Math.max(0, stockAvant - item.quantite);
      
      console.log(`📊 CALCUL STOCK - Article: ${item.article_id}`);
      console.log(`📊 Stock avant: ${stockAvant}, Quantité vendue: ${item.quantite}, Stock après: ${nouvelleQuantite}`);

      // *** MISE À JOUR OBLIGATOIRE DU STOCK ***
      const { error: updateError } = await supabase
        .from('stock_pdv')
        .update({
          quantite_disponible: nouvelleQuantite,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentStock.id);

      if (updateError) {
        console.error('❌ ERREUR CRITIQUE - Échec mise à jour stock pour article:', item.article_id, updateError);
        throw updateError;
      }

      console.log(`✅ STOCK DÉCRÉMENTÉ avec succès pour article ${item.article_id}: ${stockAvant} → ${nouvelleQuantite}`);
      
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
            destination: `PDV ${selectedPDV}`,
            numero_bon: `VENTE-${Date.now()}`,
            observations: `Vente comptoir - Déduction automatique stock PDV ${pdvNom}`,
            created_by: 'system'
          });
        
        console.log(`📝 Sortie de stock créée pour traçabilité - Article: ${item.article_id}`);
      } catch (sortieError) {
        console.warn('⚠️ Erreur création sortie stock (non bloquant):', sortieError);
      }
      
    } catch (error) {
      console.error(`❌ Erreur générale pour article ${item.article_id}:`, error);
      throw error; // Faire échouer la vente si le stock ne peut pas être mis à jour
    }
  }
  
  // Résumé des résultats
  const reussites = resultats.filter(r => r.success).length;
  
  console.log(`📊 *** RÉSUMÉ DÉCRÉMENTATION STOCK ***`);
  console.log(`✅ Articles traités avec succès: ${reussites}/${cart.length}`);
  console.log(`📦 Point de vente: ${pdvNom} (${selectedPDV})`);
  
  if (reussites !== cart.length) {
    throw new Error(`Échec décrémentation stock: ${reussites}/${cart.length} articles traités`);
  }
  
  console.log('🎯 *** DÉCRÉMENTATION STOCK TERMINÉE AVEC SUCCÈS ***');
  return resultats;
};
