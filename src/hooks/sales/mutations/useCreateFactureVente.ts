
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CreateFactureVenteData } from './types';

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFactureVenteData) => {
      console.log('🔄 Création facture vente avec données:', data);
      
      // 1. Créer la facture avec numero_facture temporaire (sera remplacé par le trigger)
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert({
          numero_facture: 'TEMP', // Valeur temporaire, sera remplacée par le trigger
          client_id: data.client_id,
          date_facture: new Date().toISOString(),
          montant_ht: data.montant_ht,
          tva: data.tva,
          montant_ttc: data.montant_ttc,
          mode_paiement: data.mode_paiement,
          // NE PAS forcer les statuts - ils seront calculés automatiquement
          statut_paiement: data.mode_paiement ? 'payee' : 'en_attente',
          statut_livraison: 'livree' // Vente comptoir = directement livrée
        })
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('✅ Facture créée avec numéro:', facture.numero_facture);

      // 2. Créer les lignes de facture pour chaque article du panier
      const lignesFacture = data.cart.map(item => ({
        facture_vente_id: facture.id,
        article_id: item.article_id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        montant_ligne: item.quantite * item.prix_unitaire,
        statut_livraison: 'livree' // Vente comptoir = directement livrée
      }));

      console.log('🔄 Création lignes facture:', lignesFacture);

      const { data: lignesCreees, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .insert(lignesFacture)
        .select();

      if (lignesError) {
        console.error('❌ Erreur création lignes facture:', lignesError);
        throw lignesError;
      }

      console.log('✅ Lignes facture créées:', lignesCreees);

      // 3. Créer le versement si un mode de paiement est spécifié
      if (data.mode_paiement) {
        const { error: versementError } = await supabase
          .from('versements_clients')
          .insert({
            client_id: data.client_id,
            facture_id: facture.id,
            montant: data.montant_ttc,
            mode_paiement: data.mode_paiement,
            date_versement: new Date().toISOString(),
            numero_versement: `V-${facture.numero_facture}`
          });

        if (versementError) {
          console.error('❌ Erreur création versement:', versementError);
          throw versementError;
        }

        console.log('✅ Versement créé pour facture:', facture.numero_facture);
      }

      // 4. Mettre à jour le stock PDV si spécifié
      if (data.point_vente_id) {
        await updateStockPDV(data, facture);
      }

      // 5. Créer une transaction financière pour la caisse avec le BON numéro de facture
      if (data.mode_paiement) {
        await createFinancialTransaction(data, facture);
      }

      return { facture, lignes: lignesCreees };
    },
    onSuccess: () => {
      console.log('✅ Facture de vente créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash_registers'] });
      toast.success('Facture créée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création de la facture:', error);
      toast.error('Erreur lors de la création de la facture');
    }
  });
};

// Helper function to update stock PDV
async function updateStockPDV(data: CreateFactureVenteData, facture: any) {
  let pointVenteId = data.point_vente_id!;
  
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
      console.log('⚠️ Continuing without stock update');
      return;
    } else {
      pointVenteId = pdvData.id;
      console.log('✅ ID point de vente trouvé:', pointVenteId);
    }
  }

  // Mettre à jour le stock pour chaque article
  for (const item of data.cart) {
    console.log(`🔄 Mise à jour stock pour article ${item.article_id}, quantité: ${item.quantite}`);
    
    // Vérifier si le stock existe
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
      // Mettre à jour le stock existant
      const nouvelleQuantite = Math.max(0, stockExistant.quantite_disponible - item.quantite);
      console.log(`📦 Stock actuel: ${stockExistant.quantite_disponible}, après vente: ${nouvelleQuantite}`);

      const { error: updateError } = await supabase
        .from('stock_pdv')
        .update({
          quantite_disponible: nouvelleQuantite,
          updated_at: new Date().toISOString()
        })
        .eq('id', stockExistant.id);

      if (updateError) {
        console.error('❌ Erreur mise à jour stock:', updateError);
      } else {
        console.log(`✅ Stock mis à jour pour article ${item.article_id}`);
      }
    } else {
      console.log(`⚠️ Aucun stock trouvé pour l'article ${item.article_id} au PDV ${pointVenteId}`);
    }
  }
}

// Helper function to create financial transaction
async function createFinancialTransaction(data: CreateFactureVenteData, facture: any) {
  console.log('💰 Création transaction financière:', data.montant_ttc);
  
  // Récupérer la première caisse disponible
  const { data: cashRegister, error: cashRegisterError } = await supabase
    .from('cash_registers')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (cashRegisterError) {
    console.error('❌ Erreur récupération caisse:', cashRegisterError);
  } else if (cashRegister) {
    // Mapper le mode de paiement
    let paymentMethod: 'cash' | 'card' | 'transfer' | 'check' = 'cash';
    
    switch(data.mode_paiement) {
      case 'carte':
        paymentMethod = 'card';
        break;
      case 'virement':
        paymentMethod = 'transfer';
        break;
      case 'cheque':
        paymentMethod = 'check';
        break;
      case 'especes':
      default:
        paymentMethod = 'cash';
        break;
    }

    // UTILISER LE VRAI NUMÉRO DE FACTURE
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'income',
        amount: data.montant_ttc,
        description: `Vente ${facture.numero_facture}`, // ✅ Utiliser le bon numéro
        category: 'sales',
        payment_method: paymentMethod,
        cash_register_id: cashRegister.id,
        date_operation: new Date().toISOString(),
        source: 'vente'
      });

    if (transactionError) {
      console.error('❌ Erreur création transaction financière:', transactionError);
    } else {
      console.log('✅ Transaction financière créée avec numéro:', facture.numero_facture);
    }
  }
}
