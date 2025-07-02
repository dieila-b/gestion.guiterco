
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

export const useFacturesVenteQuery = () => {
  return useQuery({
    queryKey: ['factures_vente', 'factures-vente-details'],
    queryFn: async () => {
      console.log('🔍 Récupération des factures de vente avec détails complets...');

      // Utiliser la fonction Supabase pour récupérer toutes les données
      const { data, error } = await supabase.rpc('get_factures_vente_with_details');

      if (error) {
        console.error('❌ Erreur lors de la récupération des factures:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ Aucune facture trouvée');
        return [];
      }

      const factures = Array.isArray(data) ? data : [data];
      
      console.log('✅ Factures récupérées avec succès:', factures.length);
      console.log('🔍 Première facture (pour debug):', factures[0]);

      // Traitement des données pour s'assurer de la cohérence
      const facturesTraitees = factures.map((facture: any) => {
        // Calcul du montant payé basé sur les versements
        const montantPaye = facture.versements?.reduce((sum: number, v: any) => sum + Number(v.montant || 0), 0) || 0;
        
        // Calcul du statut de paiement réel
        let statutPaiementReel = 'en_attente';
        if (montantPaye >= facture.montant_ttc) {
          statutPaiementReel = 'payee';
        } else if (montantPaye > 0) {
          statutPaiementReel = 'partiellement_payee';
        }

        // Normaliser le statut de livraison pour gérer les formats mixtes
        const normalizeDeliveryStatus = (status: string) => {
          if (!status) return 'en_attente';
          return status.toLowerCase()
            .replace('livrée', 'livree')
            .replace('en attente', 'en_attente')
            .replace('partiellement livrée', 'partiellement_livree')
            .replace('partiellement_livree', 'partiellement_livree')
            .replace(' ', '_');
        };

        // PRIORITÉ 1: Utiliser le statut de la facture s'il est défini
        let statutLivraisonReel = normalizeDeliveryStatus(facture.statut_livraison || 'en_attente');
        
        // PRIORITÉ 2: Si "en_attente" et qu'il y a des lignes, recalculer selon les quantités
        if (statutLivraisonReel === 'en_attente' && facture.lignes_facture && facture.lignes_facture.length > 0) {
          const totalQuantite = facture.lignes_facture.reduce((sum: number, ligne: any) => sum + ligne.quantite, 0);
          const totalLivree = facture.lignes_facture.reduce((sum: number, ligne: any) => sum + (ligne.quantite_livree || 0), 0);
          
          if (totalLivree === 0) {
            statutLivraisonReel = 'en_attente';
          } else if (totalLivree >= totalQuantite) {
            statutLivraisonReel = 'livree';
          } else {
            statutLivraisonReel = 'partiellement_livree';
          }
        }

        return {
          ...facture,
          statut_paiement_calcule: statutPaiementReel,
          statut_livraison_calcule: statutLivraisonReel,
          montant_paye_calcule: montantPaye,
          montant_restant_calcule: Math.max(0, facture.montant_ttc - montantPaye)
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
