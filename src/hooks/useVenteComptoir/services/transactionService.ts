
import { supabase } from '@/integrations/supabase/client';

// Service for managing cash register transactions
export const createCashTransaction = async (
  venteData: any,
  numeroFacture: string
) => {
  if (venteData.montant_paye <= 0) {
    console.log('ℹ️ Pas de paiement effectué (montant_paye = 0), aucune transaction de caisse créée');
    return;
  }

  console.log('💰 Création transaction de caisse pour vente payée:', venteData.montant_paye);
  
  // Récupérer la première caisse disponible
  const { data: cashRegister, error: cashRegisterError } = await supabase
    .from('cash_registers')
    .select('id')
    .limit(1)
    .single();

  if (cashRegisterError) {
    console.error('❌ Erreur récupération caisse:', cashRegisterError);
    return;
  }

  if (!cashRegister) {
    console.error('❌ Aucune caisse disponible');
    return;
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

  console.log('🔄 Insertion transaction avec format correct:', {
    type: 'income',
    amount: venteData.montant_paye,
    description: `Vente ${numeroFacture}`,
    category: 'sales',
    payment_method: paymentMethod,
    cash_register_id: cashRegister.id,
    source: 'vente'
  });

  const { error: transactionError } = await supabase
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
    });

  if (transactionError) {
    console.error('❌ Erreur création transaction de caisse:', transactionError);
  } else {
    console.log('✅ Transaction de caisse créée avec succès pour la vente:', venteData.montant_paye, 'avec numéro:', numeroFacture);
  }
};
