
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
    const { data: cashRegister, error: cashRegisterError } = await supabase
      .from('cash_registers')
      .select('id')
      .limit(1)
      .single();

    if (!cashRegisterError && cashRegister) {
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

      const { error: transactionError } = await supabase
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
        });

      if (transactionError) {
        console.error('❌ Erreur création transaction de caisse:', transactionError);
      } else {
        console.log('✅ Transaction de règlement créée avec succès');
      }
    }
  } catch (transactionError) {
    console.error('❌ Erreur création transaction financière:', transactionError);
  }
};
