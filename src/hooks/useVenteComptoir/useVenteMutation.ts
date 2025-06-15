
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { VenteComptoirData } from './types';

export const useVenteMutation = (pointsDeVente?: any[], selectedPDV?: string, setCart?: (cart: any[]) => void) => {
  const queryClient = useQueryClient();

  // Fonction pour valider un UUID
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Mutation pour créer une vente avec gestion des paiements et livraisons
  const createVente = useMutation({
    mutationFn: async (venteData: VenteComptoirData) => {
      console.log('Données de vente reçues:', venteData);

      // Validation des données critiques
      if (!isValidUUID(venteData.client_id)) {
        throw new Error(`ID client invalide: ${venteData.client_id}. Veuillez sélectionner un client valide.`);
      }

      if (!venteData.articles || venteData.articles.length === 0) {
        throw new Error('Aucun article dans le panier.');
      }

      if (venteData.montant_total <= 0) {
        throw new Error('Le montant total doit être supérieur à 0.');
      }

      if (venteData.montant_paye < 0) {
        throw new Error('Le montant payé ne peut pas être négatif.');
      }

      const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === selectedPDV);
      if (!pdvSelected) throw new Error('Point de vente non trouvé');

      // Déterminer le statut de paiement
      const montantRestant = venteData.montant_total - venteData.montant_paye;
      let statutPaiement = 'en_attente';
      
      if (venteData.montant_paye >= venteData.montant_total) {
        statutPaiement = 'paye';
      } else if (venteData.montant_paye > 0) {
        statutPaiement = 'partiel';
      }

      console.log('Statut de paiement calculé:', statutPaiement);
      console.log('Montant restant:', montantRestant);

      // Créer la commande client
      const numeroCommande = `CMD-${Date.now()}`;
      const { data: commande, error: commandeError } = await supabase
        .from('commandes_clients')
        .insert({
          numero_commande: numeroCommande,
          client_id: venteData.client_id,
          montant_ttc: venteData.montant_total,
          montant_ht: venteData.montant_total / 1.2,
          tva: venteData.montant_total - (venteData.montant_total / 1.2),
          statut: 'confirmee',
          mode_paiement: venteData.mode_paiement,
          observations: venteData.notes
        })
        .select()
        .single();

      if (commandeError) {
        console.error('Erreur création commande:', commandeError);
        throw commandeError;
      }

      console.log('Commande créée:', commande);

      // Créer les lignes de commande
      const lignesCommande = venteData.articles.map(article => {
        const prixApresRemise = Math.max(0, article.prix_vente - article.remise);
        return {
          commande_id: commande.id,
          article_id: article.id,
          quantite: article.quantite,
          prix_unitaire: prixApresRemise,
          montant_ligne: prixApresRemise * article.quantite
        };
      });

      const { error: lignesError } = await supabase
        .from('lignes_commande')
        .insert(lignesCommande);

      if (lignesError) {
        console.error('Erreur création lignes commande:', lignesError);
        throw lignesError;
      }

      // Créer la facture
      const numeroFacture = `FA-${Date.now()}`;
      
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert({
          numero_facture: numeroFacture,
          commande_id: commande.id,
          client_id: venteData.client_id,
          montant_ttc: venteData.montant_total,
          montant_ht: venteData.montant_total / 1.2,
          tva: venteData.montant_total - (venteData.montant_total / 1.2),
          statut_paiement: statutPaiement,
          mode_paiement: venteData.mode_paiement
        })
        .select()
        .single();

      if (factureError) {
        console.error('Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('Facture créée:', facture);

      // Enregistrer le versement si paiement effectué
      if (venteData.montant_paye > 0) {
        const { error: versementError } = await supabase
          .from('versements_clients')
          .insert({
            numero_versement: `VER-${Date.now()}`,
            client_id: venteData.client_id,
            facture_id: facture.id,
            montant: venteData.montant_paye,
            mode_paiement: venteData.mode_paiement,
            observations: venteData.notes || `Versement ${statutPaiement === 'paye' ? 'complet' : 'partiel'} pour facture ${numeroFacture}`
          });

        if (versementError) {
          console.error('Erreur création versement:', versementError);
          throw versementError;
        }
      }

      // Créer une transaction de caisse pour chaque vente avec paiement
      if (venteData.montant_paye > 0) {
        // Récupérer la première caisse disponible
        const { data: cashRegister } = await supabase
          .from('cash_registers')
          .select('id')
          .limit(1)
          .single();

        if (cashRegister) {
          // Mapper le mode de paiement vers les valeurs acceptées
          let paymentMethod: 'cash' | 'card' | 'transfer' | 'check' = 'cash';
          if (venteData.mode_paiement === 'carte') {
            paymentMethod = 'card';
          } else if (venteData.mode_paiement === 'virement') {
            paymentMethod = 'transfer';
          } else if (venteData.mode_paiement === 'cheque') {
            paymentMethod = 'check';
          }

          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              type: 'income',
              amount: venteData.montant_paye,
              montant: venteData.montant_paye,
              description: `Vente ${numeroFacture} - Client: ${venteData.client_id}`,
              commentaire: venteData.notes || `Paiement vente ${numeroFacture}`,
              category: 'sales',
              payment_method: paymentMethod,
              cash_register_id: cashRegister.id,
              date_operation: new Date().toISOString()
            });

          if (transactionError) {
            console.error('Erreur création transaction de caisse:', transactionError);
            // Ne pas faire échouer toute la vente pour ça, juste logger
          } else {
            console.log('Transaction de caisse créée pour la vente:', venteData.montant_paye);
          }
        }
      }

      // Mettre à jour le stock PDV
      for (const article of venteData.articles) {
        // Récupérer d'abord la quantité actuelle
        const { data: currentStock, error: fetchError } = await supabase
          .from('stock_pdv')
          .select('quantite_disponible')
          .eq('article_id', article.id)
          .eq('point_vente_id', pdvSelected.id)
          .single();

        if (fetchError) {
          console.error('Erreur récupération stock:', fetchError);
          throw fetchError;
        }

        // Calculer la nouvelle quantité
        const newQuantity = Math.max(0, currentStock.quantite_disponible - article.quantite);

        // Mettre à jour le stock
        const { error: stockError } = await supabase
          .from('stock_pdv')
          .update({
            quantite_disponible: newQuantity
          })
          .eq('article_id', article.id)
          .eq('point_vente_id', pdvSelected.id);

        if (stockError) {
          console.error('Erreur mise à jour stock:', stockError);
          throw stockError;
        }
      }

      return { 
        commande, 
        facture, 
        statutPaiement, 
        montantRestant: Math.max(0, montantRestant)
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['commandes_clients'] });
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv'] });
      // Invalider aussi les données de caisse
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['vue_solde_caisse'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
      
      setCart?.([]);
      
      if (result.statutPaiement === 'paye') {
        toast.success('Vente enregistrée avec succès - Paiement complet');
      } else if (result.statutPaiement === 'partiel') {
        toast.success(`Vente enregistrée avec succès - Paiement partiel (Reste: ${result.montantRestant.toLocaleString()} GNF)`);
      } else {
        toast.success('Vente enregistrée avec succès - En attente de paiement');
      }
    },
    onError: (error) => {
      console.error('Erreur lors de la vente:', error);
      toast.error(`Erreur lors de l'enregistrement de la vente: ${error.message}`);
    }
  });

  return {
    createVente,
    isLoading: createVente.isPending
  };
};
