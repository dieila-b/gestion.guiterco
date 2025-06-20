
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreatePrecommandeData {
  client_id: string;
  date_livraison_prevue?: string;
  observations?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  lignes: {
    article_id: string;
    quantite: number;
    prix_unitaire: number;
    montant_ligne: number;
  }[];
}

export const useCreatePrecommande = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePrecommandeData) => {
      // Générer un numéro de précommande
      const numeroPrecommande = `PRECO-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

      // Créer la précommande
      const { data: precommande, error: precommandeError } = await supabase
        .from('precommandes')
        .insert({
          numero_precommande: numeroPrecommande,
          client_id: data.client_id,
          date_livraison_prevue: data.date_livraison_prevue || null,
          observations: data.observations,
          montant_ht: data.montant_ht,
          tva: data.tva,
          montant_ttc: data.montant_ttc,
          statut: 'confirmee'
        })
        .select()
        .single();

      if (precommandeError) throw precommandeError;

      // Créer les lignes de précommande
      const lignesData = data.lignes.map(ligne => ({
        precommande_id: precommande.id,
        article_id: ligne.article_id,
        quantite: ligne.quantite,
        prix_unitaire: ligne.prix_unitaire,
        montant_ligne: ligne.montant_ligne
      }));

      const { error: lignesError } = await supabase
        .from('lignes_precommande')
        .insert(lignesData);

      if (lignesError) throw lignesError;

      return precommande;
    },
    onSuccess: (precommande) => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['precommandes'] });
      toast({
        title: "Précommande créée",
        description: `Précommande ${precommande.numero_precommande} créée avec succès`
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la création de la précommande:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la précommande",
        variant: "destructive"
      });
    }
  });
};

