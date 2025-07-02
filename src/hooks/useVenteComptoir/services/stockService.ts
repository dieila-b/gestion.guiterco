
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

// *** FONCTION CRITIQUE - DÉCRÉMENTATION STOCK OBLIGATOIRE APRÈS VENTE ***
export const updateStockAfterVente = async (cart: any[], selectedPDV: string, pdvNom: string) => {
  console.log('🔄 *** DÉCRÉMENTATION STOCK OBLIGATOIRE APRÈS VENTE ***');
  console.log('📦 Point de vente UUID reçu:', selectedPDV, '- Nom:', pdvNom);
  console.log('🛒 Articles à traiter:', cart.length);
  
  if (!cart || cart.length === 0) {
    console.warn('⚠️ Panier vide, aucun stock à décrémenter');
    return [];
  }

  if (!selectedPDV) {
    console.error('❌ *** ERREUR CRITIQUE *** Point de vente UUID manquant');
    throw new Error('Point de vente UUID requis pour la mise à jour du stock');
  }

  // *** VÉRIFICATION OBLIGATOIRE QUE C'EST UN UUID VALIDE ***
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(selectedPDV)) {
    console.error('❌ *** ERREUR CRITIQUE *** Point de vente n\'est pas un UUID valide:', selectedPDV);
    throw new Error(`Point de vente doit être un UUID valide, reçu: "${selectedPDV}"`);
  }

  console.log('✅ *** UUID PDV VALIDE *** :', selectedPDV);

  const resultats = [];
  
  for (const item of cart) {
    console.log(`🔄 *** TRAITEMENT ARTICLE *** ${item.article_id} - Quantité à déduire: ${item.quantite}`);
    
    try {
      // *** RÉCUPÉRATION STOCK ACTUEL OBLIGATOIRE ***
      const { data: currentStock, error: fetchError } = await supabase
        .from('stock_pdv')
        .select('quantite_disponible, id')
        .eq('article_id', item.article_id)
        .eq('point_vente_id', selectedPDV)
        .single();

      if (fetchError) {
        console.error('❌ Erreur récupération stock pour article:', item.article_id, fetchError);
        
        // *** SI ARTICLE N'EXISTE PAS DANS STOCK PDV, LE CRÉER AVEC QUANTITÉ 0 ***
        if (fetchError.code === 'PGRST116') {
          console.log('📦 *** CRÉATION STOCK PDV *** Article non trouvé, création avec quantité 0');
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
            note: 'Article créé avec stock 0 - Vente en négatif'
          });
          
          // *** CRÉER SORTIE DE STOCK POUR TRAÇABILITÉ ***
          await supabase
            .from('sorties_stock')
            .insert({
              article_id: item.article_id,
              quantite: item.quantite,
              type_sortie: 'vente',
              destination: `PDV ${selectedPDV}`,
              numero_bon: `VENTE-${Date.now()}`,
              observations: `Vente comptoir - Stock créé à 0 pour PDV ${pdvNom}`,
              created_by: 'system'
            });
          
          continue;
        }
        
        throw fetchError;
      }

      const stockAvant = currentStock.quantite_disponible;
      const nouvelleQuantite = Math.max(0, stockAvant - item.quantite);
      
      console.log(`📊 *** CALCUL STOCK *** Article: ${item.article_id}`);
      console.log(`📊 Stock avant: ${stockAvant}, Quantité vendue: ${item.quantite}, Stock après: ${nouvelleQuantite}`);

      // *** MISE À JOUR STOCK OBLIGATOIRE ***
      const { error: updateError } = await supabase
        .from('stock_pdv')
        .update({
          quantite_disponible: nouvelleQuantite,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentStock.id);

      if (updateError) {
        console.error('❌ *** ERREUR CRITIQUE STOCK *** Échec mise à jour pour article:', item.article_id, updateError);
        throw updateError;
      }

      console.log(`✅ *** STOCK DÉCRÉMENTÉ *** Article ${item.article_id}: ${stockAvant} → ${nouvelleQuantite}`);
      
      resultats.push({ 
        article_id: item.article_id, 
        success: true, 
        stock_avant: stockAvant, 
        stock_apres: nouvelleQuantite,
        quantite_deduite: item.quantite
      });

      // *** CRÉER SORTIE DE STOCK POUR TRAÇABILITÉ OBLIGATOIRE ***
      try {
        await supabase
          .from('sorties_stock')
          .insert({
            article_id: item.article_id,
            quantite: item.quantite,
            type_sortie: 'vente',
            destination: `PDV ${selectedPDV}`,
            numero_bon: `VENTE-${Date.now()}`,
            observations: `Vente comptoir - Déduction automatique stock PDV ${pdvNom || selectedPDV}`,
            created_by: 'system'
          });
        
        console.log(`📝 *** SORTIE STOCK CRÉÉE *** Article: ${item.article_id}`);
      } catch (sortieError) {
        console.warn('⚠️ Erreur création sortie stock (non bloquant):', sortieError);
      }
      
    } catch (error) {
      console.error(`❌ *** ERREUR ARTICLE *** ${item.article_id}:`, error);
      throw error; // *** FAIRE ÉCHOUER LA VENTE SI STOCK NON MIS À JOUR ***
    }
  }
  
  // *** RÉSUMÉ OBLIGATOIRE ***
  const reussites = resultats.filter(r => r.success).length;
  
  console.log(`📊 *** RÉSUMÉ DÉCRÉMENTATION STOCK ***`);
  console.log(`✅ Articles traités avec succès: ${reussites}/${cart.length}`);
  console.log(`📦 Point de vente: ${pdvNom || selectedPDV} (UUID: ${selectedPDV})`);
  
  if (reussites !== cart.length) {
    throw new Error(`*** ÉCHEC DÉCRÉMENTATION STOCK *** : ${reussites}/${cart.length} articles traités`);
  }
  
  console.log('🎯 *** DÉCRÉMENTATION STOCK TERMINÉE AVEC SUCCÈS ***');
  return resultats;
};
