
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

export const useFacturesImpayeesQuery = () => {
  return useQuery({
    queryKey: ['factures_impayees'],
    queryFn: async () => {
      console.log('🔍 Récupération des factures impayées...');

      // Récupérer seulement les factures non payées ou partiellement payées
      const { data: factures, error } = await supabase
        .from('factures_vente')
        .select(`
          id,
          numero_facture,
          date_facture,
          client_id,
          montant_ht,
          tva,
          montant_ttc,
          statut_paiement,
          mode_paiement,
          observations,
          created_at,
          updated_at
        `)
        .in('statut_paiement', ['en_attente', 'partiellement_payee'])
        .order('date_facture', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Erreur factures impayées:', error);
        throw error;
      }

      if (!factures || factures.length === 0) {
        console.log('ℹ️ Aucune facture impayée trouvée');
        return [];
      }

      console.log('✅ Factures impayées récupérées:', factures.length);

      // Enrichir avec clients et versements
      const enrichedFactures = await Promise.all(
        factures.map(async (facture) => {
          // Client avec tous les champs requis
          const { data: client } = await supabase
            .from('clients')
            .select('id, nom, prenom, email, telephone, created_at, updated_at')
            .eq('id', facture.client_id)
            .maybeSingle();

          // Versements pour calculer le montant payé
          const { data: versements } = await supabase
            .from('versements_clients')
            .select('montant')
            .eq('facture_id', facture.id);

          const montantPaye = versements?.reduce((sum, v) => sum + Number(v.montant || 0), 0) || 0;
          const montantRestant = facture.montant_ttc - montantPaye;

          return {
            ...facture,
            client,
            versements: versements || [],
            montant_paye_calcule: montantPaye,
            montant_restant_calcule: Math.max(0, montantRestant)
          } as FactureVente;
        })
      );

      // Filtrer les factures qui ont vraiment un montant restant
      const facturesVraimentImpayees = enrichedFactures.filter(f => f.montant_restant_calcule! > 0);

      return facturesVraimentImpayees;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 1000
  });
};
