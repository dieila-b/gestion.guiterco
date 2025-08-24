
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PrecommandeComplete } from '@/types/precommandes';

export const usePrecommandesComplete = () => {
  return useQuery({
    queryKey: ['precommandes-complete'],
    queryFn: async () => {
      console.log('🔍 Récupération des précommandes complètes...');

      const { data, error } = await supabase
        .from('precommandes')
        .select(`
          id,
          numero_precommande,
          client_id,
          date_precommande,
          date_livraison_prevue,
          statut,
          statut_livraison,
          montant_ht,
          tva,
          montant_ttc,
          taux_tva,
          acompte_verse,
          reste_a_payer,
          total_commande,
          observations,
          notification_envoyee,
          date_notification,
          bon_livraison_genere,
          bon_livraison_id,
          payment_status,
          amount_paid,
          amount_due,
          stock_status,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limiter pour éviter les surcharges

      if (error) {
        console.error('❌ Erreur précommandes:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ Aucune précommande trouvée');
        return [];
      }

      console.log('✅ Précommandes récupérées:', data.length);

      // Enrichir avec les données séparément pour éviter les jointures complexes
      const enrichedData = await Promise.all(
        data.map(async (precommande) => {
          const promises = [];

          // Client
          promises.push(
            supabase
              .from('clients')
              .select('id, nom, email, telephone')
              .eq('id', precommande.client_id)
              .single()
          );

          // Lignes de précommande
          promises.push(
            supabase
              .from('lignes_precommande')
              .select(`
                id,
                precommande_id,
                article_id,
                quantite,
                quantite_livree,
                statut_ligne,
                prix_unitaire,
                montant_ligne,
                created_at
              `)
              .eq('precommande_id', precommande.id)
          );

          // Notifications
          promises.push(
            supabase
              .from('notifications_precommandes')
              .select('*')
              .eq('precommande_id', precommande.id)
              .order('date_creation', { ascending: false })
          );

          const [clientResult, lignesResult, notificationsResult] = await Promise.all(promises);

          // Enrichir les lignes avec les articles
          let lignesEnrichies = [];
          if (lignesResult.data && lignesResult.data.length > 0) {
            lignesEnrichies = await Promise.all(
              lignesResult.data.map(async (ligne) => {
                const { data: article } = await supabase
                  .from('catalogue')
                  .select('id, nom, reference, prix_vente')
                  .eq('id', ligne.article_id)
                  .single();

                // Calculer le stock disponible de façon simple
                const { data: stockData } = await supabase.rpc('get_total_stock_available', {
                  p_article_id: ligne.article_id
                });

                return {
                  ...ligne,
                  article,
                  stock_disponible: {
                    entrepot: 0,
                    pdv: 0,
                    total: stockData || 0
                  }
                };
              })
            );
          }

          return {
            ...precommande,
            client: clientResult.data,
            lignes_precommande: lignesEnrichies,
            notifications: notificationsResult.data || []
          };
        })
      );

      return enrichedData as PrecommandeComplete[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 1000
  });
};
