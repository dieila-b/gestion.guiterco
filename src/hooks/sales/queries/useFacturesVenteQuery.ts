
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

export const useFacturesVenteQuery = () => {
  return useQuery({
    queryKey: ['factures_vente', 'with-details'],
    queryFn: async () => {
      try {
        console.log('🔍 Récupération des factures de vente avec détails complets...');

        // Récupérer les factures principales avec clients
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
            updated_at,
            client:clients(
              id,
              nom,
              prenom,
              nom_entreprise,
              email,
              telephone
            )
          `)
          .order('date_facture', { ascending: false })
          .order('created_at', { ascending: false });

        if (facturesError) {
          console.error('❌ Erreur lors de la récupération des factures:', facturesError);
          throw facturesError;
        }

        // Vérification de sécurité renforcée
        if (!facturesData || !Array.isArray(facturesData)) {
          console.log('⚠️ Aucune facture trouvée ou données invalides');
          return [];
        }

        console.log('✅ Factures récupérées:', facturesData.length);

        // Récupérer les lignes de facture pour toutes les factures
        const factureIds = facturesData.map(f => f?.id).filter(Boolean);
        console.log('🔍 IDs des factures:', factureIds);
        
        let lignesData = [];
        if (factureIds.length > 0) {
          const { data: lignesResult, error: lignesError } = await supabase
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
              created_at,
              article:catalogue(
                id,
                nom,
                reference
              )
            `)
            .in('facture_vente_id', factureIds);

          if (lignesError) {
            console.error('❌ Erreur lors de la récupération des lignes:', lignesError);
          } else {
            lignesData = lignesResult || [];
          }
        }

        // Récupérer les versements pour toutes les factures
        let versementsData = [];
        if (factureIds.length > 0) {
          const { data: versementsResult, error: versementsError } = await supabase
            .from('versements_clients')
            .select(`
              id,
              facture_id,
              client_id,
              montant,
              mode_paiement,
              date_versement,
              numero_versement,
              reference_paiement,
              observations,
              created_at,
              updated_at
            `)
            .in('facture_id', factureIds);

          if (versementsError) {
            console.error('❌ Erreur lors de la récupération des versements:', versementsError);
          } else {
            versementsData = versementsResult || [];
          }
        }

        // Traitement des données pour créer la structure finale
        const facturesTraitees = facturesData.map((facture: any) => {
          // Vérification de sécurité pour chaque facture
          if (!facture || !facture.id) {
            console.warn('Facture invalide détectée:', facture);
            return null;
          }

          // Associer les lignes de facture de manière sécurisée
          const lignesFacture = Array.isArray(lignesData) 
            ? lignesData.filter(ligne => ligne?.facture_vente_id === facture.id) 
            : [];
          
          // Associer les versements de manière sécurisée
          const versements = Array.isArray(versementsData) 
            ? versementsData.filter(versement => versement?.facture_id === facture.id) 
            : [];
          
          // Calcul du montant payé basé sur les versements
          const montantPaye = versements.reduce((sum: number, v: any) => {
            const montant = Number(v?.montant || 0);
            return sum + (isNaN(montant) ? 0 : montant);
          }, 0);
          
          // Calcul du statut de paiement réel
          let statutPaiementReel = 'en_attente';
          const montantTTC = Number(facture.montant_ttc || 0);
          if (montantPaye >= montantTTC) {
            statutPaiementReel = 'payee';
          } else if (montantPaye > 0) {
            statutPaiementReel = 'partiellement_payee';
          }

          // Calcul du statut de livraison basé sur les quantités
          let statutLivraisonReel = 'en_attente';
          if (lignesFacture.length > 0) {
            const totalQuantite = lignesFacture.reduce((sum: number, ligne: any) => {
              const qty = Number(ligne?.quantite || 0);
              return sum + (isNaN(qty) ? 0 : qty);
            }, 0);
            const totalLivree = lignesFacture.reduce((sum: number, ligne: any) => {
              const qtyLivree = Number(ligne?.quantite_livree || 0);
              return sum + (isNaN(qtyLivree) ? 0 : qtyLivree);
            }, 0);
            
            if (totalLivree === 0) {
              statutLivraisonReel = 'en_attente';
            } else if (totalLivree >= totalQuantite) {
              statutLivraisonReel = 'livree';
            } else {
              statutLivraisonReel = 'partiellement_livree';
            }
          } else {
            // Si pas de lignes, utiliser le statut de la facture
            statutLivraisonReel = facture.statut_livraison || 'livree';
          }

          return {
            ...facture,
            lignes_facture: lignesFacture,
            versements: versements,
            nb_articles: lignesFacture.length,
            statut_paiement_calcule: statutPaiementReel,
            statut_livraison_calcule: statutLivraisonReel,
            montant_paye_calcule: montantPaye,
            montant_restant_calcule: Math.max(0, montantTTC - montantPaye)
          };
        }).filter(Boolean); // Filtrer les factures nulles

        console.log('✅ Factures traitées avec statuts calculés:', facturesTraitees.length);
        return facturesTraitees as FactureVente[];
      } catch (error) {
        console.error('❌ Erreur critique dans useFacturesVenteQuery:', error);
        return [];
      }
    },
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
