import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CartItem } from '@/hooks/useVenteComptoir/types';

interface CreateFactureVenteData {
  client_id: string;
  cart: CartItem[];
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement?: string;
  point_vente_id?: string;
  montant_paye?: number;
}

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFactureVenteData) => {
      console.log('🔄 Création facture vente avec données:', data);
      
      // Calculer le statut de paiement basé sur le montant payé vs montant total
      const montantPaye = data.montant_paye || data.montant_ttc;
      let statutPaiement = 'en_attente';
      
      if (montantPaye >= data.montant_ttc) {
        statutPaiement = 'payee';
      } else if (montantPaye > 0) {
        statutPaiement = 'partiellement_payee';
      }

      console.log('💰 Calcul statut paiement:', {
        montantPaye,
        montantTTC: data.montant_ttc,
        statut: statutPaiement
      });
      
      // 1. Créer la facture avec le bon statut de livraison initial
      const numeroFacture = `F-${Date.now()}`;
      
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert({
          numero_facture: numeroFacture,
          client_id: data.client_id,
          date_facture: new Date().toISOString(),
          montant_ht: data.montant_ht,
          tva: data.tva,
          montant_ttc: data.montant_ttc,
          mode_paiement: data.mode_paiement,
          statut_paiement: statutPaiement,
          statut_livraison: 'en_attente' // Démarre en attente
        })
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('✅ Facture créée:', facture);

      // 2. Créer les lignes de facture
      const lignesFacture = data.cart.map(item => ({
        facture_vente_id: facture.id,
        article_id: item.article_id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        montant_ligne: item.quantite * item.prix_unitaire,
        statut_livraison: 'livree' // Pour vente comptoir
      }));

      console.log('🔄 Création lignes facture:', lignesFacture);

      const { data: lignesCreees, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .insert(lignesFacture)
        .select();

      if (lignesError) {
        console.error('❌ Erreur création lignes facture:', lignesError);
        throw lignesError;
      }

      console.log('✅ Lignes facture créées:', lignesCreees);

      // 3. Mettre à jour le statut de livraison de la facture
      const { error: updateFactureError } = await supabase
        .from('factures_vente')
        .update({ statut_livraison: 'livree' })
        .eq('id', facture.id);

      if (updateFactureError) {
        console.error('❌ Erreur mise à jour statut livraison:', updateFactureError);
      }

      // 4. Créer le versement si montant payé
      if (montantPaye > 0) {
        const { error: versementError } = await supabase
          .from('versements_clients')
          .insert({
            client_id: data.client_id,
            facture_id: facture.id,
            montant: montantPaye,
            mode_paiement: data.mode_paiement || 'espece',
            date_versement: new Date().toISOString(),
            numero_versement: `V-${facture.numero_facture}`
          });

        if (versementError) {
          console.error('❌ Erreur création versement:', versementError);
          throw versementError;
        }

        console.log('✅ Versement créé pour facture:', facture.numero_facture);
      }

      // 5. CORRECTION : Mise à jour du stock PDV plus robuste
      if (data.point_vente_id) {
        console.log('🔄 Mise à jour stock PDV pour:', data.point_vente_id);
        
        // Rechercher le point de vente par nom
        const { data: pointVente, error: pdvError } = await supabase
          .from('points_de_vente')
          .select('id, nom')
          .eq('nom', data.point_vente_id)
          .single();

        if (pdvError || !pointVente) {
          console.error('❌ Point de vente non trouvé:', data.point_vente_id, pdvError);
          // Ne pas faire échouer la vente pour un problème de stock
        } else {
          console.log('✅ Point de vente trouvé:', pointVente);
          
          // Traitement du stock pour chaque article
          const stockErrors = [];
          
          for (const item of data.cart) {
            try {
              // Vérifier d'abord si l'enregistrement existe
              const { data: stockActuel, error: stockSelectError } = await supabase
                .from('stock_pdv')
                .select('quantite_disponible, id')
                .eq('article_id', item.article_id)
                .eq('point_vente_id', pointVente.id)
                .maybeSingle(); // Utiliser maybeSingle au lieu de single

              if (stockSelectError) {
                console.error('❌ Erreur lecture stock PDV pour article:', item.article_id, stockSelectError);
                stockErrors.push(`Article ${item.article_id}: ${stockSelectError.message}`);
                continue;
              }

              if (!stockActuel) {
                console.warn('⚠️ Aucun stock trouvé pour article:', item.article_id, 'dans PDV:', pointVente.nom);
                // Créer un nouvel enregistrement avec quantité 0
                const { error: createStockError } = await supabase
                  .from('stock_pdv')
                  .insert({
                    article_id: item.article_id,
                    point_vente_id: pointVente.id,
                    quantite_disponible: 0, // Démarre à 0 puisqu'il n'y avait pas de stock
                    derniere_livraison: new Date().toISOString()
                  });

                if (createStockError) {
                  console.error('❌ Erreur création stock PDV:', createStockError);
                  stockErrors.push(`Création stock article ${item.article_id}: ${createStockError.message}`);
                }
                continue;
              }

              const nouvelleQuantite = Math.max(0, stockActuel.quantite_disponible - item.quantite);
              
              console.log('📦 Mise à jour stock:', {
                article_id: item.article_id,
                article_nom: item.nom,
                quantite_actuelle: stockActuel.quantite_disponible,
                quantite_vendue: item.quantite,
                nouvelle_quantite: nouvelleQuantite
              });

              const { error: stockError } = await supabase
                .from('stock_pdv')
                .update({
                  quantite_disponible: nouvelleQuantite,
                  updated_at: new Date().toISOString()
                })
                .eq('id', stockActuel.id);

              if (stockError) {
                console.error('❌ Erreur mise à jour stock PDV:', stockError);
                stockErrors.push(`Article ${item.article_id}: ${stockError.message}`);
              } else {
                console.log('✅ Stock mis à jour pour article:', item.nom, 'Nouvelle quantité:', nouvelleQuantite);
              }
            } catch (error) {
              console.error('❌ Erreur inattendue lors de la mise à jour du stock:', error);
              stockErrors.push(`Article ${item.article_id}: Erreur inattendue`);
            }
          }

          if (stockErrors.length > 0) {
            console.warn('⚠️ Erreurs lors de la mise à jour du stock:', stockErrors);
            // Optionnel: notifier l'utilisateur mais ne pas faire échouer la vente
          } else {
            console.log('✅ Tous les stocks PDV mis à jour avec succès');
          }
        }
      }

      return { facture, lignes: lignesCreees };
    },
    onSuccess: () => {
      console.log('✅ Facture de vente créée avec succès');
      // Invalider plusieurs caches pour forcer le rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] }); // Hook alternatif
      queryClient.invalidateQueries({ queryKey: ['versements_clients'] });
      toast.success('Vente enregistrée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création de la facture:', error);
      toast.error('Erreur lors de la création de la facture: ' + error.message);
    }
  });
};

// Exports pour les autres mutations
export const useUpdateFactureStatut = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ factureId, statut_livraison }: { factureId: string, statut_livraison: string }) => {
      const { data, error } = await supabase
        .from('factures_vente')
        .update({ statut_livraison })
        .eq('id', factureId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      toast.success('Statut mis à jour');
    }
  });
};

export const useCreateVersement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ facture_id, client_id, montant, mode_paiement, reference_paiement, observations }: {
      facture_id: string;
      client_id: string;
      montant: number;
      mode_paiement: string;
      reference_paiement?: string;
      observations?: string;
    }) => {
      const { data, error } = await supabase
        .from('versements_clients')
        .insert({
          facture_id,
          client_id,
          montant,
          mode_paiement,
          reference_paiement,
          observations,
          date_versement: new Date().toISOString(),
          numero_versement: `V-${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['versements_clients'] });
      toast.success('Paiement enregistré');
    }
  });
};
