
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

export const useFacturesVenteQuery = () => {
  return useQuery({
    queryKey: ['factures_vente', 'factures-vente-details'],
    queryFn: async () => {
      console.log('🔍 Récupération des factures de vente avec détails complets...');

      const { data, error } = await supabase
        .from('factures_vente')
        .select(`
          *,
          client:clients(*),
          commande:commandes_clients(*),
          livraison_statut:statut_livraison_id(id, nom),
          lignes_facture:lignes_facture_vente(
            *,
            article:catalogue(id, nom, reference)
          ),
          versements:versements_clients(*)
        `)
        .order('date_facture', { ascending: false });

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

        // Utiliser le nom du statut de livraison depuis la relation
        const statutLivraisonNom = facture.livraison_statut?.nom || 'En attente';
        
        // Mapper vers les valeurs attendues par l'interface
        let statutLivraisonInterface = 'en_attente';
        switch (statutLivraisonNom.toLowerCase()) {
          case 'livrée':
            statutLivraisonInterface = 'livree';
            break;
          case 'partiellement livrée':
            statutLivraisonInterface = 'partiellement_livree';
            break;
          case 'en attente':
          default:
            statutLivraisonInterface = 'en_attente';
            break;
        }

        return {
          ...facture,
          statut_paiement_calcule: statutPaiementReel,
          statut_livraison: statutLivraisonInterface, // Pour compatibilité avec l'interface existante
          statut_livraison_nom: statutLivraisonNom, // Le nom réel depuis la relation
          montant_paye_calcule: montantPaye,
          montant_restant_calcule: Math.max(0, facture.montant_ttc - montantPaye),
          nb_articles: facture.lignes_facture?.length || 0
        };
      });

      console.log('✅ Factures traitées avec statuts calculés:', facturesTraitees.length);
      return facturesTraitees as FactureVente[];
    },
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};
