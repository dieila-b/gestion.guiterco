
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
  montant_paye?: number; // Montant effectivement payé
}

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFactureVenteData) => {
      console.log('🔄 Création facture vente avec données:', data);
      
      // Calculer le statut de paiement basé sur le montant payé vs montant total
      const montantPaye = data.montant_paye || data.montant_ttc; // Par défaut, vente comptoir = payée entièrement
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
      
      // 1. Créer la facture avec le statut correct
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
          statut_livraison: 'en_attente' // Commence en attente, sera mis à jour selon la livraison
        })
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('✅ Facture créée:', facture);

      // 2. Créer les lignes de facture pour chaque article du panier
      const lignesFacture = data.cart.map(item => ({
        facture_vente_id: facture.id,
        article_id: item.article_id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        montant_ligne: item.quantite * item.prix_unitaire,
        statut_livraison: 'livree' // Pour vente comptoir, articles livrés immédiatement
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

      // 3. Mettre à jour le statut de livraison de la facture à "livree" pour vente comptoir
      const { error: updateFactureError } = await supabase
        .from('factures_vente')
        .update({ statut_livraison: 'livree' })
        .eq('id', facture.id);

      if (updateFactureError) {
        console.error('❌ Erreur mise à jour statut livraison:', updateFactureError);
      }

      // 4. Créer le versement si un montant est payé
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

      // 5. Mettre à jour le stock PDV si spécifié
      if (data.point_vente_id) {
        console.log('🔄 Mise à jour stock PDV pour point de vente:', data.point_vente_id);
        
        // Récupérer l'ID du point de vente à partir du nom
        const { data: pointVente, error: pdvError } = await supabase
          .from('points_de_vente')
          .select('id')
          .eq('nom', data.point_vente_id)
          .single();

        if (pdvError) {
          console.error('❌ Erreur recherche point de vente:', pdvError);
        } else {
          console.log('✅ Point de vente trouvé:', pointVente);
          
          for (const item of data.cart) {
            // Récupérer la quantité actuelle pour la mise à jour
            const { data: stockActuel, error: stockSelectError } = await supabase
              .from('stock_pdv')
              .select('quantite_disponible')
              .eq('article_id', item.article_id)
              .eq('point_vente_id', pointVente.id)
              .single();

            if (stockSelectError) {
              console.error('❌ Erreur lecture stock PDV pour article:', item.article_id, stockSelectError);
              continue;
            }

            const nouvelleQuantite = Math.max(0, stockActuel.quantite_disponible - item.quantite);
            console.log('📦 Mise à jour stock:', {
              article_id: item.article_id,
              quantite_actuelle: stockActuel.quantite_disponible,
              quantite_vendue: item.quantite,
              nouvelle_quantite: nouvelleQuantite
            });

            const { error: stockError } = await supabase
              .from('stock_pdv')
              .update({
                quantite_disponible: nouvelleQuantite
              })
              .eq('article_id', item.article_id)
              .eq('point_vente_id', pointVente.id);

            if (stockError) {
              console.error('❌ Erreur mise à jour stock PDV:', stockError);
              // Ne pas faire échouer la transaction pour un problème de stock
            } else {
              console.log('✅ Stock mis à jour pour article:', item.article_id);
            }
          }
          console.log('✅ Stock PDV mis à jour pour tous les articles');
        }
      }

      return { facture, lignes: lignesCreees };
    },
    onSuccess: () => {
      console.log('✅ Facture de vente créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv'] }); // Invalider le cache du stock
      toast.success('Facture créée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création de la facture:', error);
      toast.error('Erreur lors de la création de la facture');
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
