
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

export const useFacturesVenteQuery = () => {
  return useQuery({
    queryKey: ['factures_vente'],
    queryFn: async () => {
      console.log('🔍 Récupération des factures de vente...');

      const { data: facturesData, error: facturesError } = await supabase
        .from('factures_vente')
        .select(`
          id,
          numero_facture,
          date_facture,
          client_id,
          montant_ht,
          tva,
          montant_ttc,
          remise_totale,
          taux_tva,
          statut_paiement,
          statut_livraison,
          mode_paiement,
          date_paiement,
          observations,
          created_at,
          updated_at
        `)
        .order('date_facture', { ascending: false })
        .limit(50);

      if (facturesError) {
        console.error('❌ Erreur factures:', facturesError);
        throw facturesError;
      }

      if (!facturesData || facturesData.length === 0) {
        console.log('ℹ️ Aucune facture trouvée');
        return [];
      }

      console.log('✅ Factures récupérées:', facturesData.length);

      // Enrichir avec les données client, lignes et versements séparément
      const enrichedFactures = await Promise.all(
        facturesData.map(async (facture) => {
          // Récupérer le client avec tous les champs requis
          const { data: client } = await supabase
            .from('clients')
            .select('id, nom, prenom, nom_entreprise, email, telephone, created_at, updated_at')
            .eq('id', facture.client_id)
            .maybeSingle();

          // Récupérer les lignes de facture avec tous les champs requis
          const { data: lignes } = await supabase
            .from('lignes_facture_vente')
            .select(`
              id,
              facture_vente_id,
              article_id,
              quantite,
              quantite_livree,
              prix_unitaire_brut,
              remise_unitaire,
              montant_ligne,
              statut_livraison,
              created_at
            `)
            .eq('facture_vente_id', facture.id);

          // Récupérer les versements avec tous les champs requis
          const { data: versements } = await supabase
            .from('versements_clients')
            .select(`
              id,
              numero_versement,
              client_id,
              facture_id,
              date_versement,
              montant,
              mode_paiement,
              reference_paiement,
              observations,
              created_at,
              updated_at
            `)
            .eq('facture_id', facture.id);

          const montantPaye = versements?.reduce((sum, v) => sum + Number(v.montant || 0), 0) || 0;

          return {
            ...facture,
            client,
            lignes_facture: lignes || [],
            versements: versements || [],
            nb_articles: lignes?.length || 0,
            montant_paye_calcule: montantPaye,
            montant_restant_calcule: Math.max(0, facture.montant_ttc - montantPaye)
          } as FactureVente;
        })
      );

      return enrichedFactures;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 2000
  });
};
