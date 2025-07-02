
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

export const useFacturesVenteQuery = () => {
  return useQuery({
    queryKey: ['factures_vente', 'factures-vente-details'],
    queryFn: async () => {
      console.log('🔍 Récupération des factures de vente avec relation livraison_statut...');

      const { data, error } = await supabase
        .from('factures_vente')
        .select(`
          *,
          client:clients(*),
          commande:commandes_clients(*),
          livraison_statut!fk_facture_statut_livraison(
            id,
            nom
          ),
          lignes_facture:lignes_facture_vente(
            *,
            article:catalogue(
              id,
              nom,
              reference
            )
          ),
          versements:versements_clients(*)
        `)
        .order('date_facture', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des factures:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ Aucune facture trouvée');
        return [];
      }

      console.log('✅ Factures récupérées avec succès:', data.length);
      console.log('🔍 Première facture (pour debug):', data[0]);

      // Traitement des données pour s'assurer de la cohérence
      const facturesTraitees = data.map((facture: any) => {
        // Calcul du montant payé basé sur les versements
        const montantPaye = facture.versements?.reduce((sum: number, v: any) => sum + Number(v.montant || 0), 0) || 0;
        
        // Calcul du statut de paiement réel
        let statutPaiementReel = 'en_attente';
        if (montantPaye >= facture.montant_ttc) {
          statutPaiementReel = 'payee';
        } else if (montantPaye > 0) {
          statutPaiementReel = 'partiellement_payee';
        }

        // Utiliser EXCLUSIVEMENT le statut depuis la table livraison_statut
        const statutLivraisonFromDB = facture.livraison_statut?.nom;
        let statutLivraisonFinal = 'en_attente';
        
        if (statutLivraisonFromDB) {
          // Mapper le nom de la table livraison_statut vers le format attendu
          switch (statutLivraisonFromDB.toLowerCase()) {
            case 'livrée':
              statutLivraisonFinal = 'livree';
              break;
            case 'partiellement livrée':
              statutLivraisonFinal = 'partiellement_livree';
              break;
            case 'en attente':
            default:
              statutLivraisonFinal = 'en_attente';
              break;
          }
        }

        console.log(`🚚 Facture ${facture.numero_facture} - Statut DB: "${statutLivraisonFromDB}" → Interface: "${statutLivraisonFinal}"`);

        return {
          ...facture,
          statut_paiement_calcule: statutPaiementReel,
          statut_livraison: statutLivraisonFinal, // Statut formaté pour l'interface
          statut_livraison_nom: statutLivraisonFromDB || 'En attente', // Nom original pour affichage
          montant_paye_calcule: montantPaye,
          montant_restant_calcule: Math.max(0, facture.montant_ttc - montantPaye),
          nb_articles: facture.lignes_facture?.length || 0
        };
      });

      console.log('✅ Factures traitées avec statuts depuis livraison_statut:', facturesTraitees.length);
      return facturesTraitees as FactureVente[];
    },
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};
