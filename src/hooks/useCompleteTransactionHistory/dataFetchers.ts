
import { supabase } from '@/integrations/supabase/client';

export const fetchTransactions = async (startDate: Date, endDate: Date) => {
  const { data: transactions, error: transError } = await supabase
    .from('transactions')
    .select('id, type, amount, montant, description, date_operation, created_at, source')
    .gte('date_operation', startDate.toISOString())
    .lte('date_operation', endDate.toISOString())
    .not('description', 'ilike', '%Règlement VERS-%');

  if (transError) {
    console.error('❌ Erreur transactions:', transError);
    throw transError;
  }

  return transactions;
};

export const fetchCashOperations = async (startDate: Date, endDate: Date) => {
  const { data: cashOps, error: cashError } = await supabase
    .from('cash_operations')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (cashError) {
    console.error('❌ Erreur cash_operations:', cashError);
    throw cashError;
  }

  return cashOps;
};

export const fetchExpenses = async (startDate: Date, endDate: Date) => {
  const { data: expenses, error: expError } = await supabase
    .from('sorties_financieres')
    .select('*')
    .gte('date_sortie', startDate.toISOString())
    .lte('date_sortie', endDate.toISOString());

  if (expError) {
    console.error('❌ Erreur sorties_financieres:', expError);
    throw expError;
  }

  return expenses;
};

export const fetchVersements = async (startDate: Date, endDate: Date) => {
  const { data: versements, error: versementsError } = await supabase
    .from('versements_clients')
    .select('*')
    .gte('date_versement', startDate.toISOString())
    .lte('date_versement', endDate.toISOString());

  if (versementsError) {
    console.error('❌ Erreur versements_clients:', versementsError);
    throw versementsError;
  }

  return versements;
};

export const fetchBalanceData = async () => {
  const { data: balanceData } = await supabase
    .from('vue_solde_caisse')
    .select('solde_actif')
    .single();

  return balanceData;
};
