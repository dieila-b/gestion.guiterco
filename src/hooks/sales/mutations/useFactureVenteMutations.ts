
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateVersementInput {
  facture_id: string;
  client_id: string;
  montant: number;
  mode_paiement: string;
  reference_paiement?: string;
  observations?: string;
}

interface UpdateFactureStatutInput {
  factureId: string;
  statut_livraison?: string;
  statut_paiement?: string;
}

export const useCreateVersement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (versement: CreateVersementInput) => {
      console.log('🏦 DÉBUT création versement - Données reçues:', {
        facture_id: versement.facture_id,
        montant: versement.montant,
        mode_paiement: versement.mode_paiement
      });

      // Vérifier que le montant est positif
      if (!versement.montant || versement.montant <= 0) {
        console.error('❌ ERREUR: Montant invalide:', versement.montant);
        throw new Error('Le montant doit être supérieur à 0');
      }

      // Générer un numéro de versement unique
      const numeroVersement = `VER-${Date.now()}`;
      console.log('🏦 Numéro versement généré:', numeroVersement);

      // Créer le versement dans versements_clients
      console.log('💳 INSERTION versement dans versements_clients...');
      const { data: versementData, error: versementError } = await supabase
        .from('versements_clients')
        .insert({
          numero_versement: numeroVersement,
          client_id: versement.client_id,
          facture_id: versement.facture_id,
          montant: versement.montant,
          mode_paiement: versement.mode_paiement,
          reference_paiement: versement.reference_paiement || null,
          observations: versement.observations || null,
          date_versement: new Date().toISOString()
        })
        .select()
        .single();
      
      if (versementError) {
        console.error('❌ ERREUR création versement:', versementError);
        throw new Error(`Erreur versement: ${versementError.message}`);
      }
      
      console.log('✅ Versement créé avec succès:', {
        id: versementData.id,
        numero: versementData.numero_versement,
        montant: versementData.montant
      });

      // Récupérer les informations de la facture
      console.log('🔍 Récupération informations facture...');
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .select('numero_facture, montant_ttc, client_id, statut_paiement')
        .eq('id', versement.facture_id)
        .single();
      
      if (factureError) {
        console.error('❌ ERREUR récupération facture:', factureError);
        throw new Error(`Erreur facture: ${factureError.message}`);
      }
      
      console.log('📄 Facture trouvée:', {
        numero: facture.numero_facture,
        montant_ttc: facture.montant_ttc,
        client_id: facture.client_id,
        statut_actuel: facture.statut_paiement
      });

      // Récupérer la première caisse disponible
      console.log('🏦 Recherche caisse disponible...');
      const { data: cashRegister, error: cashRegisterError } = await supabase
        .from('cash_registers')
        .select('id, name')
        .limit(1)
        .single();

      if (cashRegisterError || !cashRegister) {
        console.error('❌ ERREUR: Aucune caisse trouvée:', cashRegisterError);
        throw new Error('Aucune caisse disponible pour enregistrer le paiement');
      }
      
      console.log('🏦 Caisse sélectionnée:', {
        id: cashRegister.id,
        name: cashRegister.name
      });

      // Mapper le mode de paiement pour la table transactions
      let paymentMethod: 'cash' | 'card' | 'transfer' | 'check' = 'cash';
      switch(versement.mode_paiement) {
        case 'carte':
        case 'carte_bancaire':
          paymentMethod = 'card';
          break;
        case 'virement':
          paymentMethod = 'transfer';
          break;
        case 'cheque':
          paymentMethod = 'check';
          break;
        default:
          paymentMethod = 'cash';
          break;
      }

      console.log('💰 Mode paiement mappé:', {
        original: versement.mode_paiement,
        mapped: paymentMethod
      });

      // Créer automatiquement une transaction de caisse
      console.log('💰 CRÉATION transaction de caisse...');
      const transactionData = {
        type: 'income' as const,
        amount: versement.montant,
        montant: versement.montant,
        description: `Règlement facture ${facture.numero_facture}`,
        commentaire: versement.observations || `Paiement facture ${facture.numero_facture} (${versement.mode_paiement})`,
        category: 'sales' as const,
        payment_method: paymentMethod,
        cash_register_id: cashRegister.id,
        date_operation: new Date().toISOString(),
        source: 'Règlement facture'
      };
      
      console.log('💰 Données transaction à insérer:', transactionData);
      
      const { data: transactionResult, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        console.error('❌ ERREUR création transaction:', transactionError);
        throw new Error(`Erreur transaction: ${transactionError.message}`);
      }
      
      console.log('✅ Transaction créée avec succès:', {
        id: transactionResult.id,
        type: transactionResult.type,
        amount: transactionResult.amount,
        description: transactionResult.description
      });

      // Calculer le nouveau statut de paiement
      console.log('🔄 Calcul du nouveau statut de paiement...');
      
      // Récupérer tous les versements de cette facture
      const { data: allVersements, error: versementsError } = await supabase
        .from('versements_clients')
        .select('montant')
        .eq('facture_id', versement.facture_id);
        
      if (versementsError) {
        console.error('❌ Erreur récupération versements:', versementsError);
      } else {
        const totalPaye = allVersements?.reduce((sum, v) => sum + (v.montant || 0), 0) || 0;
        console.log('💰 Total payé:', totalPaye, 'sur', facture.montant_ttc);
        
        let nouveauStatut = 'en_attente';
        if (totalPaye >= facture.montant_ttc) {
          nouveauStatut = 'payee';
        } else if (totalPaye > 0) {
          nouveauStatut = 'partiellement_payee';
        }
        
        console.log('🔄 Nouveau statut calculé:', nouveauStatut);
        
        // Mettre à jour le statut de la facture
        const { error: updateError } = await supabase
          .from('factures_vente')
          .update({ 
            statut_paiement: nouveauStatut,
            date_paiement: nouveauStatut === 'payee' ? new Date().toISOString() : null
          })
          .eq('id', versement.facture_id);
          
        if (updateError) {
          console.error('❌ Erreur mise à jour statut facture:', updateError);
        } else {
          console.log('✅ Statut facture mis à jour:', nouveauStatut);
        }
      }

      console.log('🎉 SUCCÈS COMPLET - Versement et transaction créés');
      return versementData;
    },
    onSuccess: () => {
      console.log('🔄 Invalidation des queries après succès...');
      // Invalider toutes les queries nécessaires
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['versements_clients'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      
      toast({
        title: "Paiement enregistré",
        description: "Le versement a été ajouté avec succès et crédité en caisse.",
      });
    },
    onError: (error) => {
      console.error('❌ ÉCHEC COMPLET création versement:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer le paiement: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateFactureStatut = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ factureId, ...updates }: UpdateFactureStatutInput) => {
      console.log('🔄 Mise à jour statut facture:', factureId, updates);
      
      const { data, error } = await supabase
        .from('factures_vente')
        .update(updates)
        .eq('id', factureId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erreur mise à jour statut:', error);
        throw error;
      }
      
      console.log('✅ Statut facture mis à jour:', data);
      return data;
    },
    onSuccess: () => {
      // Invalider toutes les queries de factures
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la facture a été modifié avec succès.",
      });
    },
    onError: (error) => {
      console.error('❌ Erreur mise à jour statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  });
};
