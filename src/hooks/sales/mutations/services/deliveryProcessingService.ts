
import { supabase } from '@/integrations/supabase/client';

export const processDelivery = async (paymentData: any, facture: any, lignesCreees: any[]) => {
  console.log('📦 Début traitement livraison:', paymentData);
  
  if (!paymentData || (!paymentData.statut_livraison && paymentData.statut_livraison !== 'partiel')) {
    console.log('⚠️ Aucune livraison à traiter');
    return;
  }

  console.log('📦 Traitement livraison:', paymentData.statut_livraison);
  
  // Traitement pour livraison partielle uniquement (les complètes sont déjà gérées)
  if (paymentData.statut_livraison === 'partiel') {
    console.log('📦 Livraison partielle - Mise à jour des quantités spécifiques');
    
    // Traiter chaque ligne avec les quantités spécifiées
    for (const [itemId, quantiteLivree] of Object.entries(paymentData.quantite_livree || {})) {
      const ligne = lignesCreees?.find(l => l.article_id === itemId);
      if (ligne && typeof quantiteLivree === 'number' && quantiteLivree > 0) {
        const statutLigne = quantiteLivree >= ligne.quantite ? 'livree' : 'partiellement_livree';
        
        await supabase
          .from('lignes_facture_vente')
          .update({ 
            statut_livraison: statutLigne,
            quantite_livree: quantiteLivree 
          })
          .eq('id', ligne.id);
          
        console.log(`📦 Ligne ${ligne.id} - Statut: ${statutLigne}, Quantité livrée: ${quantiteLivree}`);
      }
    }

    // Déterminer le statut global de la facture basé sur les lignes
    const toutesLignesLivrees = lignesCreees?.every(ligne => {
      const quantiteSpecifiee = paymentData.quantite_livree?.[ligne.article_id] || 0;
      return quantiteSpecifiee >= ligne.quantite;
    });

    const statutFactureGlobal = toutesLignesLivrees ? 'livree' : 'partiellement_livree';

    await supabase
      .from('factures_vente')
      .update({ statut_livraison: statutFactureGlobal })
      .eq('id', facture.id);

    console.log('✅ Livraison partielle traitée - Statut facture:', statutFactureGlobal);
  }
};
