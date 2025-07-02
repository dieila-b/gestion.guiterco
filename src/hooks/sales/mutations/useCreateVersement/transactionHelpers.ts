
import { supabase } from '@/integrations/supabase/client';

export const checkExistingTransaction = async (numeroFacture: string, montant: number) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data: existingTransactions, error: transError } = await supabase
    .from('transactions')
    .select('id, amount, description')
    .ilike('description', `%${numeroFacture}%`)
    .eq('amount', montant)
    .eq('type', 'income')
    .gte('created_at', oneHourAgo);

  if (transError) {
    console.error('❌ Erreur vérification transactions existantes:', transError);
  }

  return existingTransactions && existingTransactions.length > 0;
};

export const createCashTransaction = async (
  montant: number, 
  numeroFacture: string, 
  mode_paiement: string, 
  observations?: string
) => {
  try {
    // Vérifier qu'il n'existe pas déjà une transaction similaire
    const alreadyExists = await checkExistingTransaction(numeroFacture, montant);
    if (alreadyExists) {
      console.log('ℹ️ Transaction déjà existante pour:', numeroFacture);
      return;
    }

    const { data: cashRegister, error: cashRegisterError } = await supabase
      .from('cash_registers')
      .select('id')
      .limit(1)
      .single();

    if (cashRegisterError || !cashRegister) {
      console.error('❌ Erreur récupération caisse, création d\'une caisse par défaut');
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
      
      cashRegister.id = newCashRegister.id;
    }

    let paymentMethod: 'cash' | 'card' | 'transfer' | 'check' = 'cash';
    
    switch(mode_paiement) {
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

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'income',
        amount: montant,
        montant: montant,
        description: `Règlement facture ${numeroFacture}`,
        commentaire: observations || `Versement pour facture ${numeroFacture}`,
        category: 'sales',
        payment_method: paymentMethod,
        cash_register_id: cashRegister.id,
        date_operation: new Date().toISOString(),
        source: 'facture'
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Erreur création transaction de caisse:', transactionError);
      throw transactionError;
    }

    // Mettre à jour le solde de la caisse
    const { data: currentBalance, error: balanceError } = await supabase
      .from('cash_registers')
      .select('balance')
      .eq('id', cashRegister.id)
      .single();

    if (!balanceError && currentBalance) {
      await supabase
        .from('cash_registers')
        .update({
          balance: (currentBalance.balance || 0) + montant,
          updated_at: new Date().toISOString()
        })
        .eq('id', cashRegister.id);
    }

    console.log('✅ Transaction de règlement créée avec succès pour:', numeroFacture, 'montant:', montant);
    return transaction;

  } catch (transactionError) {
    console.error('❌ Erreur création transaction financière:', transactionError);
    throw transactionError;
  }
};
