
import { supabase } from '@/integrations/supabase/client';

export const fetchTransactions = async (startDate: Date, endDate: Date) => {
  const { data: transactions, error: transError } = await supabase
    .from('transactions')
    .select('id, type, amount, montant, description, date_operation, created_at, source')
    .gte('date_operation', startDate.toISOString())
    .lte('date_operation', endDate.toISOString())
    .not('description', 'ilike', '%Règlement vers-caisse%')
    .not('description', 'ilike', '%Règlement vers-compte%')
    .not('description', 'ilike', '%Règlement interne%')
    .not('description', 'ilike', '%Reglement vers-caisse%')
    .not('description', 'ilike', '%Reglement vers-compte%')
    .not('description', 'ilike', '%Reglement interne%')
    .not('description', 'ilike', '%Transfert interne%');

  if (transError) {
    console.error('❌ Erreur transactions:', transError);
    throw transError;
  }

  // Filtrage supplémentaire côté client pour sécurité
  const filteredTransactions = (transactions || []).filter(t => {
    const desc = (t.description || '').toLowerCase();
    const isInternal = desc.includes('règlement vers-caisse') || 
                      desc.includes('règlement vers-compte') || 
                      desc.includes('règlement interne') ||
                      desc.includes('reglement vers-caisse') || 
                      desc.includes('reglement vers-compte') ||
                      desc.includes('reglement interne') ||
                      desc.includes('transfert interne');
    if (isInternal) {
      console.log('🚫 Exclusion transaction BD:', t.description);
    }
    return !isInternal;
  });

  console.log(`📊 Transactions récupérées: ${transactions?.length || 0}, après filtrage: ${filteredTransactions.length}`);
  return filteredTransactions;
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
  return filteredCashOps;
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
  return filteredExpenses;
};

export const fetchVersements = async (startDate: Date, endDate: Date) => {
  try {
    console.log('🔍 Récupération versements pour la période:', {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });

    // Récupérer tous les versements dans la période 
    const { data: versements, error: versementsError } = await supabase
      .from('versements_clients')
      .select('*')
      .gte('date_versement', startDate.toISOString())
      .lte('date_versement', endDate.toISOString());

    if (versementsError) {
      console.error('❌ Erreur versements_clients:', versementsError);
      return [];
    }

    console.log('🧾 Versements récupérés (bruts):', versements?.length || 0, versements);

    if (!versements || versements.length === 0) {
      console.log('ℹ️ Aucun versement trouvé dans la période');
      return [];
    }

    // Récupérer les factures associées pour vérifier leur statut
    const factureIds = versements.map(v => v.facture_id).filter(Boolean);
    
    let facturesPayees = [];
    if (factureIds.length > 0) {
      try {
        console.log('🔍 Récupération factures pour IDs:', factureIds);
        const { data: factures, error: facturesError } = await supabase
          .from('factures_vente')
          .select('id, statut_paiement, numero_facture')
          .in('id', factureIds);
        
        console.log('📄 Factures trouvées:', factures);
        
        if (!facturesError && factures) {
          facturesPayees = factures;
        } else if (facturesError) {
          console.warn('⚠️ Erreur lors du chargement des factures:', facturesError);
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de la récupération des factures:', error);
      }
    }

    // Filtrer les versements pour ne garder que ceux valides
    const filteredVersements = versements.filter(v => {
      const numeroVersement = v.numero_versement || '';
      console.log('🔍 Analyse versement:', {
        numero: numeroVersement,
        facture_id: v.facture_id,
        montant: v.montant
      });

      // Plus spécifique : uniquement les vrais règlements internes
      const isInternal = numeroVersement.toLowerCase().includes('vers-caisse') || 
                        numeroVersement.toLowerCase().includes('vers-compte') ||
                        numeroVersement.toLowerCase().includes('reglement interne') ||
                        numeroVersement.toLowerCase().includes('transfert interne');
      
      if (isInternal) {
        console.log('🚫 Exclusion versement interne:', numeroVersement);
        return false;
      }
      
      // Si on a pu récupérer les factures, vérifier le statut
      if (facturesPayees.length > 0) {
        const facture = facturesPayees.find(f => f.id === v.facture_id);
        console.log('🔍 Facture associée:', facture);
        
        const facturePayee = facture && ['payee', 'partiellement_payee'].includes(facture.statut_paiement);
        
        if (!facturePayee) {
          console.log('🚫 Exclusion versement facture non payée:', {
            numero: v.numero_versement,
            facture_trouvee: !!facture,
            statut_facture: facture?.statut_paiement
          });
          return false;
        }
        
        console.log('✅ Versement valide:', {
          numero: v.numero_versement,
          statut_facture: facture.statut_paiement,
          montant: v.montant
        });
      } else {
        // Si pas de factures récupérées, on laisse passer le versement
        console.log('⚠️ Aucune facture récupérée, acceptation du versement par défaut');
      }
      
      return true;
    });

    console.log(`🧾 Versements après filtrage: ${filteredVersements.length}`);
    return filteredVersements;
    
  } catch (error) {
    console.error('❌ Erreur critique dans fetchVersements:', error);
    return [];
  }
};

export const fetchBalanceData = async () => {
  try {
    const { data: balanceData, error } = await supabase
      .from('vue_solde_caisse')
      .select('solde_actif')
      .single();

    if (error) {
      console.warn('⚠️ Erreur vue_solde_caisse:', error);
      return null;
    }

    return balanceData;
  } catch (error) {
    console.warn('⚠️ Erreur critique fetchBalanceData:', error);
    return null;
  }
};
