
import { supabase } from '@/integrations/supabase/client';

export const fetchTransactions = async (startDate: Date, endDate: Date) => {
  console.log('🔍 Récupération transactions entre:', startDate.toISOString(), 'et', endDate.toISOString());
  
  const { data: transactions, error: transError } = await supabase
    .from('transactions')
    .select('id, type, amount, montant, description, date_operation, created_at, source')
    .gte('date_operation', startDate.toISOString())
    .lte('date_operation', endDate.toISOString())
    .not('description', 'ilike', '%Règlement VERS-%')
    .not('description', 'ilike', '%Règlement V-%')
    .not('description', 'ilike', '%Règlement VER-%')
    .not('description', 'ilike', '%Reglement VERS-%')
    .not('description', 'ilike', '%Reglement V-%')
    .not('description', 'ilike', '%Reglement VER-%');

  if (transError) {
    console.error('❌ Erreur transactions:', transError);
    throw transError;
  }

  // Filtrage supplémentaire côté client pour sécurité
  const filteredTransactions = (transactions || []).filter(t => {
    const desc = (t.description || '').toLowerCase();
    const isInternal = desc.includes('règlement vers-') || 
                      desc.includes('règlement v-') || 
                      desc.includes('règlement ver-') ||
                      desc.includes('reglement vers-') || 
                      desc.includes('reglement v-') ||
                      desc.includes('reglement ver-');
    if (isInternal) {
      console.log('🚫 Exclusion transaction BD:', t.description);
    }
    return !isInternal;
  });

  console.log(`📊 Transactions récupérées: ${transactions?.length || 0}, après filtrage: ${filteredTransactions.length}`);
  
  // Log détaillé pour débuggage
  filteredTransactions.forEach(t => {
    console.log('✅ Transaction validée:', {
      id: t.id,
      type: t.type,
      amount: t.amount || t.montant,
      description: t.description,
      date: t.date_operation,
      source: t.source
    });
  });
  
  return filteredTransactions;
};

export const fetchCashOperations = async (startDate: Date, endDate: Date) => {
  console.log('🔍 Récupération cash operations entre:', startDate.toISOString(), 'et', endDate.toISOString());
  
  const { data: cashOps, error: cashError } = await supabase
    .from('cash_operations')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (cashError) {
    console.error('❌ Erreur cash_operations:', cashError);
    throw cashError;
  }

  // Filtrage des opérations de caisse contenant des règlements internes
  const filteredCashOps = (cashOps || []).filter(c => {
    const desc = (c.commentaire || '').toLowerCase();
    const isInternal = desc.includes('règlement vers-') || 
                      desc.includes('règlement v-') || 
                      desc.includes('règlement ver-') ||
                      desc.includes('reglement vers-') || 
                      desc.includes('reglement v-') ||
                      desc.includes('reglement ver-');
    if (isInternal) {
      console.log('🚫 Exclusion cash operation:', c.commentaire);
    }
    return !isInternal;
  });

  console.log(`💰 Cash operations récupérées: ${cashOps?.length || 0}, après filtrage: ${filteredCashOps.length}`);
  
  // Log détaillé pour débuggage
  filteredCashOps.forEach(c => {
    console.log('✅ Cash operation validée:', {
      id: c.id,
      type: c.type,
      montant: c.montant,
      commentaire: c.commentaire,
      created_at: c.created_at
    });
  });
  
  return filteredCashOps;
};

export const fetchExpenses = async (startDate: Date, endDate: Date) => {
  console.log('🔍 Récupération sorties financières entre:', startDate.toISOString(), 'et', endDate.toISOString());
  
  const { data: expenses, error: expError } = await supabase
    .from('sorties_financieres')
    .select('*')
    .gte('date_sortie', startDate.toISOString())
    .lte('date_sortie', endDate.toISOString());

  if (expError) {
    console.error('❌ Erreur sorties_financieres:', expError);
    throw expError;
  }

  // Filtrage des sorties financières contenant des règlements internes
  const filteredExpenses = (expenses || []).filter(e => {
    const desc = (e.description || '').toLowerCase();
    const isInternal = desc.includes('règlement vers-') || 
                      desc.includes('règlement v-') || 
                      desc.includes('règlement ver-') ||
                      desc.includes('reglement vers-') || 
                      desc.includes('reglement v-') ||
                      desc.includes('reglement ver-');
    if (isInternal) {
      console.log('🚫 Exclusion expense:', e.description);
    }
    return !isInternal;
  });

  console.log(`💸 Expenses récupérées: ${expenses?.length || 0}, après filtrage: ${filteredExpenses.length}`);
  
  // Log détaillé pour débuggage
  filteredExpenses.forEach(e => {
    console.log('✅ Expense validée:', {
      id: e.id,
      montant: e.montant,
      description: e.description,
      date_sortie: e.date_sortie
    });
  });
  
  return filteredExpenses;
};

export const fetchVersements = async (startDate: Date, endDate: Date) => {
  console.log('🔍 Récupération versements entre:', startDate.toISOString(), 'et', endDate.toISOString());
  
  const { data: versements, error: versementsError } = await supabase
    .from('versements_clients')
    .select('*')
    .gte('date_versement', startDate.toISOString())
    .lte('date_versement', endDate.toISOString());

  if (versementsError) {
    console.error('❌ Erreur versements_clients:', versementsError);
    throw versementsError;
  }

  // Filtrage des versements internes (VERS-, V-, VER-)
  const filteredVersements = (versements || []).filter(v => {
    const numeroVersement = v.numero_versement || '';
    const isInternal = numeroVersement.toLowerCase().includes('vers-') || 
                      numeroVersement.toLowerCase().includes('v-') ||
                      numeroVersement.toLowerCase().includes('ver-');
    if (isInternal) {
      console.log('🚫 Exclusion versement interne:', numeroVersement);
    }
    return !isInternal;
  });

  console.log(`🧾 Versements récupérés: ${versements?.length || 0}, après filtrage: ${filteredVersements.length}`);
  
  // Log détaillé pour débuggage
  filteredVersements.forEach(v => {
    console.log('✅ Versement validé:', {
      id: v.id,
      montant: v.montant,
      numero_versement: v.numero_versement,
      date_versement: v.date_versement
    });
  });
  
  return filteredVersements;
};

export const fetchBalanceData = async () => {
  const { data: balanceData } = await supabase
    .from('vue_solde_caisse')
    .select('solde_actif')
    .single();

  console.log('💰 Solde caisse récupéré:', balanceData?.solde_actif);
  return balanceData;
};
