
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
          mode_paiement: venteData.mode_paiement,
          statut_livraison: venteData.statut_livraison
        })
        .select()
        .single();

      if (factureError) {
        console.error('Erreur création facture:', factureError);
        throw factureError;
      }

      console.log('Facture créée:', facture);

      // Créer les lignes de facture
      const lignesFacture = venteData.articles.map(article => {
        const prixApresRemise = Math.max(0, article.prix_vente - article.remise);
        return {
          facture_vente_id: facture.id,
          article_id: article.id,
          quantite: article.quantite,
          prix_unitaire: prixApresRemise,
          montant_ligne: prixApresRemise * article.quantite
        };
      });

      const { error: lignesFactureError } = await supabase
        .from('lignes_facture_vente')
        .insert(lignesFacture);

      if (lignesFactureError) {
        console.error('Erreur création lignes facture:', lignesFactureError);
        throw lignesFactureError;
      }

      // Si un paiement a été effectué, une transaction doit être enregistrée
      if (venteData.montant_paye > 0) {
        // Récupérer la première caisse disponible pour les transactions
        const { data: cashRegisters } = await supabase
          .from('cash_registers')
          .select('id')
          .limit(1);

        const cashRegisterId = cashRegisters?.[0]?.id;
        
        if (!cashRegisterId) {
          throw new Error("Aucune caisse n'est configurée. Impossible d'enregistrer la transaction.");
        }

        // Créer une transaction pour la vente (entrée de caisse)
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            cash_register_id: cashRegisterId,
            type: 'income',
            amount: venteData.montant_paye,
            category: 'sales',
            payment_method: venteData.mode_paiement === 'especes' ? 'cash' : 
                           venteData.mode_paiement === 'carte' ? 'card' :
                           venteData.mode_paiement === 'virement' ? 'transfer' :
                           venteData.mode_paiement === 'cheque' ? 'check' : 'cash',
            description: `Vente ${numeroFacture} - ${venteData.articles.length} article(s)`,
            commentaire: venteData.notes || `Paiement ${statutPaiement === 'paye' ? 'complet' : 'partiel'} pour facture ${numeroFacture}`,
            date_operation: new Date().toISOString()
          });

        if (transactionError) {
          console.error('Erreur création transaction:', transactionError);
          throw transactionError; // On propage l'erreur pour que la mutation échoue
        }
      }

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
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-financieres'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-financieres-aujourdhui'] });
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
