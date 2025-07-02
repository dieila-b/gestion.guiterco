
import { supabase } from '@/integrations/supabase/client';

// Service for managing cash register transactions
export const createCashTransaction = async (
  venteData: any,
  numeroFacture: string
) => {
  if (!venteData.montant_paye || venteData.montant_paye <= 0) {
    console.log('ℹ️ Pas de paiement effectué (montant_paye = 0), aucune transaction de caisse créée');
    return;
  }

  console.log('💰 Création transaction de caisse pour vente payée:', venteData.montant_paye);
  
  try {
    // Récupérer la première caisse disponible
    const { data: cashRegister, error: cashRegisterError } = await supabase
      .from('cash_registers')
      .select('id')
      .limit(1)
      .single();

    if (cashRegisterError || !cashRegister) {
      console.error('❌ Erreur récupération caisse:', cashRegisterError);
      // Créer une caisse par défaut si aucune n'existe
      const { data: newCashRegister, error: createError } = await supabase
        .from('cash_registers')
        .insert({
          name: 'Caisse Principale',
          balance: 0,
          status: 'open'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur création caisse par défaut:', createError);
        return;
      }
      
      console.log('✅ Caisse principale créée automatiquement');
      cashRegister.id = newCashRegister.id;
    }

    // Mapper le mode de paiement vers les valeurs acceptées par Supabase
    let paymentMethod: 'cash' | 'card' | 'transfer' | 'check' = 'cash';
    
    switch(venteData.mode_paiement) {
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

    console.log('🔄 Insertion transaction vente avec format correct:', {
      type: 'income',
      amount: venteData.montant_paye,
      description: `Vente ${numeroFacture}`,
      category: 'sales',
      payment_method: paymentMethod,
      cash_register_id: cashRegister.id,
      source: 'vente'
    });

    // Créer la transaction de caisse
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'income',
        amount: venteData.montant_paye,
        montant: venteData.montant_paye,
        description: `Vente ${numeroFacture}`,
        commentaire: venteData.notes || `Paiement vente ${numeroFacture} - Client: ${venteData.client_id}`,
        category: 'sales',
        payment_method: paymentMethod,
        cash_register_id: cashRegister.id,
        date_operation: new Date().toISOString(),
        source: 'vente'
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Erreur création transaction de caisse:', transactionError);
      throw transactionError;
    }

    // Mettre à jour le solde de la caisse - utiliser une approche manuelle
    const { data: currentBalance, error: balanceError } = await supabase
      .from('cash_registers')
      .select('balance')
      .eq('id', cashRegister.id)
      .single();

    if (!balanceError && currentBalance) {
      const newBalance = (currentBalance.balance || 0) + venteData.montant_paye;
      
      const { error: updateError } = await supabase
        .from('cash_registers')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', cashRegister.id);

      if (updateError) {
        console.error('❌ Erreur mise à jour solde caisse:', updateError);
      }
    }

    console.log('✅ Transaction de caisse créée avec succès:', {
      id: transaction.id,
      montant: venteData.montant_paye,
      numeroFacture,
      paymentMethod
    });

    return transaction;

  } catch (error) {
    console.error('❌ Erreur critique lors de la création de la transaction de caisse:', error);
    throw error;
  }
};
