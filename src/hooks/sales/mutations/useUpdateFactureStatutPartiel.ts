
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUpdateFactureStatutPartiel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      factureId, 
      quantitesLivrees 
    }: { 
      factureId: string, 
      quantitesLivrees: Record<string, number> 
    }) => {
      console.log('🚚 Mise à jour livraison partielle pour facture:', factureId);
      console.log('📦 Quantités livrées:', quantitesLivrees);

      // Récupérer les lignes de facture pour traitement
      const { data: lignesFacture, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .select('*')
        .eq('facture_vente_id', factureId);

      if (lignesError) {
        console.error('❌ Erreur récupération lignes facture:', lignesError);
        throw lignesError;
      }

      // Mettre à jour chaque ligne selon les quantités livrées
      for (const ligne of lignesFacture) {
        const quantiteLivree = quantitesLivrees[ligne.article_id] || 0;
        let nouveauStatut = 'en_attente';
        
        if (quantiteLivree > 0) {
          nouveauStatut = quantiteLivree >= ligne.quantite ? 'livree' : 'partiellement_livree';
        }

        console.log(`📦 Ligne ${ligne.id}: ${quantiteLivree}/${ligne.quantite} → ${nouveauStatut}`);

        const { error: updateError } = await supabase
          .from('lignes_facture_vente')
          .update({ statut_livraison: nouveauStatut })
          .eq('id', ligne.id);

        if (updateError) {
          console.error('❌ Erreur mise à jour ligne:', updateError);
          throw updateError;
        }
      }

      // Calculer le statut global de la facture
      const totalLignes = lignesFacture.length;
      const lignesLivrees = Object.values(quantitesLivrees).filter(qty => qty > 0).length;
      const lignesCompletes = lignesFacture.filter(ligne => {
        const qtyLivree = quantitesLivrees[ligne.article_id] || 0;
        return qtyLivree >= ligne.quantite;
      }).length;

      let statutGlobal = 'en_attente';
      if (lignesCompletes === totalLignes && lignesLivrees > 0) {
        statutGlobal = 'livree';
      } else if (lignesLivrees > 0) {
        statutGlobal = 'partiellement_livree';
      }

      console.log('🚚 Statut global calculé:', statutGlobal);

      // Mettre à jour le statut global de la facture
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .update({ statut_livraison: statutGlobal })
        .eq('id', factureId)
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur mise à jour facture:', factureError);
        throw factureError;
      }

      console.log('✅ Livraison partielle mise à jour avec succès');
      return facture;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      toast.success('Livraison partielle enregistrée');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la mise à jour de la livraison partielle:', error);
      toast.error('Erreur lors de la mise à jour de la livraison partielle');
    }
  });
};
