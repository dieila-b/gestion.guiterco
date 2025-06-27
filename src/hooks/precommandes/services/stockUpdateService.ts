
import { supabase } from '@/integrations/supabase/client';
import type { LignePrecommandeComplete } from '@/types/precommandes';

export const updateStockOnDelivery = async (lignes: LignePrecommandeComplete[], precommandeId: string) => {
  console.log('🔄 Début mise à jour stock pour précommande:', precommandeId);
  
  for (const ligne of lignes) {
    if (!ligne.article_id) {
      console.warn('⚠️ Article ID manquant pour la ligne:', ligne.id);
      continue;
    }

    const quantiteLivreeActuelle = ligne.quantite_livree || 0;
    
    // Récupérer l'ancienne quantité livrée pour calculer la différence
    const { data: ancienneLigne, error: fetchError } = await supabase
      .from('lignes_precommande')
      .select('quantite_livree')
      .eq('id', ligne.id)
      .single();

    if (fetchError) {
      console.error('❌ Erreur récupération ancienne quantité:', fetchError);
      continue;
    }

    const ancienneQuantiteLivree = ancienneLigne?.quantite_livree || 0;
    const differenceQuantite = quantiteLivreeActuelle - ancienneQuantiteLivree;
    
    if (differenceQuantite <= 0) {
      console.log('ℹ️ Pas de nouvelle quantité à déduire pour l\'article:', ligne.article_id);
      continue;
    }

    console.log(`📦 Déduction stock - Article: ${ligne.article_id}, Quantité: ${differenceQuantite}`);

    // Essayer de déduire d'abord du stock entrepôt
    const { data: stockEntrepot, error: stockEntrepotError } = await supabase
      .from('stock_principal')
      .select('id, quantite_disponible, entrepot_id')
      .eq('article_id', ligne.article_id)
      .gt('quantite_disponible', 0)
      .order('quantite_disponible', { ascending: false })
      .limit(1);

    if (stockEntrepotError) {
      console.error('❌ Erreur vérification stock entrepôt:', stockEntrepotError);
      continue;
    }

    let quantiteRestante = differenceQuantite;

    // Déduire du stock entrepôt si disponible
    if (stockEntrepot && stockEntrepot.length > 0) {
      const stock = stockEntrepot[0];
      const quantiteADeduire = Math.min(quantiteRestante, stock.quantite_disponible);

      if (quantiteADeduire > 0) {
        const nouvelleQuantite = Math.max(0, stock.quantite_disponible - quantiteADeduire);
        
        const { error: updateError } = await supabase
          .from('stock_principal')
          .update({
            quantite_disponible: nouvelleQuantite,
            updated_at: new Date().toISOString()
          })
          .eq('id', stock.id);

        if (updateError) {
          console.error('❌ Erreur mise à jour stock entrepôt:', updateError);
          throw new Error(`Impossible de mettre à jour le stock entrepôt pour l'article ${ligne.article_id}`);
        }

        console.log(`✅ Stock entrepôt mis à jour - Article: ${ligne.article_id}, ${stock.quantite_disponible} → ${nouvelleQuantite}`);
        quantiteRestante -= quantiteADeduire;

        // Créer une sortie de stock pour traçabilité
        const { error: sortieError } = await supabase
          .from('sorties_stock')
          .insert({
            article_id: ligne.article_id,
            entrepot_id: stock.entrepot_id,
            quantite: quantiteADeduire,
            type_sortie: 'livraison_precommande',
            destination: 'Client',
            observations: `Livraison précommande - Ligne: ${ligne.id}`,
            created_by: 'system'
          });

        if (sortieError) {
          console.warn('⚠️ Erreur création sortie stock:', sortieError);
        }
      }
    }

    // Si il reste encore de la quantité à déduire, essayer les points de vente
    if (quantiteRestante > 0) {
      const { data: stockPDV, error: stockPDVError } = await supabase
        .from('stock_pdv')
        .select('id, quantite_disponible, point_vente_id')
        .eq('article_id', ligne.article_id)
        .gt('quantite_disponible', 0)
        .order('quantite_disponible', { ascending: false })
        .limit(1);

      if (stockPDVError) {
        console.error('❌ Erreur vérification stock PDV:', stockPDVError);
        continue;
      }

      if (stockPDV && stockPDV.length > 0) {
        const stock = stockPDV[0];
        const quantiteADeduire = Math.min(quantiteRestante, stock.quantite_disponible);

        if (quantiteADeduire > 0) {
          const nouvelleQuantite = Math.max(0, stock.quantite_disponible - quantiteADeduire);
          
          const { error: updateError } = await supabase
            .from('stock_pdv')
            .update({
              quantite_disponible: nouvelleQuantite,
              updated_at: new Date().toISOString()
            })
            .eq('id', stock.id);

          if (updateError) {
            console.error('❌ Erreur mise à jour stock PDV:', updateError);
            throw new Error(`Impossible de mettre à jour le stock PDV pour l'article ${ligne.article_id}`);
          }

          console.log(`✅ Stock PDV mis à jour - Article: ${ligne.article_id}, ${stock.quantite_disponible} → ${nouvelleQuantite}`);
          quantiteRestante -= quantiteADeduire;
        }
      }
    }

    // Alerter si stock insuffisant
    if (quantiteRestante > 0) {
      console.warn(`⚠️ Stock insuffisant pour l'article ${ligne.article_id} - Quantité manquante: ${quantiteRestante}`);
    }
  }

  console.log('✅ Mise à jour stock terminée pour précommande:', precommandeId);
};
