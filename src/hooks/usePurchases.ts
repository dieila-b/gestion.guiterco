import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { BonCommande, BonLivraison, FactureAchat, RetourFournisseur } from '@/types/purchases';

// Gestion des bons de commande
export const useBonsCommande = () => {
  const queryClient = useQueryClient();

  const { data: bonsCommande, isLoading, error, refetch } = useQuery({
    queryKey: ['bons-commande'],
    queryFn: async () => {
      console.log('Fetching bons de commande...');
      const { data, error } = await supabase
        .from('bons_de_commande')
        .select(`
          *,
          fournisseur_data:fournisseur_id (
            id,
            nom_entreprise,
            nom,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bons de commande:', error);
        throw error;
      }
      
      console.log('Fetched bons de commande with relations:', data);
      return data as BonCommande[];
    },
  });

  const createBonCommande = useMutation({
    mutationFn: async (bonCommande: Omit<BonCommande, 'id' | 'created_at' | 'updated_at' | 'numero_bon'> & { articles?: any[] }) => {
      console.log('Creating bon de commande:', bonCommande);
      
      // Extraire les articles de l'objet bonCommande
      const { articles, ...bonCommandeData } = bonCommande;
      
      // Le numéro sera généré automatiquement par le trigger, donc on ne l'inclut pas
      const { data: newBonCommande, error: bonCommandeError } = await supabase
        .from('bons_de_commande')
        .insert([bonCommandeData])
        .select()
        .single();

      if (bonCommandeError) {
        console.error('Error creating bon de commande:', bonCommandeError);
        throw bonCommandeError;
      }

      console.log('Bon de commande created with auto-generated number:', newBonCommande);

      // Si des articles sont fournis, les insérer dans articles_bon_commande
      if (articles && articles.length > 0) {
        console.log('Inserting articles:', articles);
        
        const articlesData = articles.map(article => ({
          bon_commande_id: newBonCommande.id,
          article_id: article.article_id,
          quantite: article.quantite,
          prix_unitaire: Number(article.prix_unitaire),
          montant_ligne: Number(article.montant_ligne)
        }));

        const { error: articlesError } = await supabase
          .from('articles_bon_commande')
          .insert(articlesData);

        if (articlesError) {
          console.error('Error inserting articles:', articlesError);
          toast({
            title: "Attention",
            description: "Le bon de commande a été créé mais il y a eu un problème avec les articles.",
            variant: "destructive",
          });
        } else {
          console.log('Articles inserted successfully');
        }
      }

      return newBonCommande;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-commande-articles-counts'] });
      toast({
        title: "Succès",
        description: "Bon de commande créé avec succès",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('Error in createBonCommande mutation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du bon de commande",
        variant: "destructive",
      });
    }
  });

  const updateBonCommande = useMutation({
    mutationFn: async ({ id, ...bon }: Partial<BonCommande> & { id: string }) => {
      const { data, error } = await supabase
        .from('bons_de_commande')
        .update(bon)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BonCommande;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      toast({
        title: "Bon de commande mis à jour avec succès",
        variant: "default",
      });
    }
  });

  const deleteBonCommande = useMutation({
    mutationFn: async (id: string) => {
      // D'abord supprimer les articles liés
      const { error: articlesError } = await supabase
        .from('articles_bon_commande')
        .delete()
        .eq('bon_commande_id', id);
      
      if (articlesError) {
        console.error('Error deleting articles:', articlesError);
      }
      
      // Ensuite supprimer le bon de commande
      const { error } = await supabase
        .from('bons_de_commande')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-commande-articles-counts'] });
      toast({
        title: "Bon de commande supprimé avec succès",
        variant: "default",
      });
    }
  });

  return {
    bonsCommande,
    isLoading,
    error,
    refetch,
    createBonCommande,
    updateBonCommande,
    deleteBonCommande
  };
};

// Gestion des bons de livraison
export const useBonsLivraison = () => {
  const queryClient = useQueryClient();
  
  const { data: bonsLivraison, isLoading, error } = useQuery({
    queryKey: ['bons-livraison'],
    queryFn: async () => {
      console.log('Fetching bons de livraison...');
      const { data, error } = await supabase
        .from('bons_de_livraison')
        .select(`
          *,
          bon_commande:bons_de_commande!fk_bons_livraison_bon_commande_id(
            id,
            numero_bon,
            fournisseur,
            fournisseur_id,
            date_commande,
            date_livraison_prevue,
            statut,
            statut_paiement,
            montant_total,
            tva,
            montant_ht,
            remise,
            frais_livraison,
            frais_logistique,
            transit_douane,
            taux_tva,
            montant_paye,
            observations,
            created_at,
            updated_at,
            created_by
          ),
          entrepot_destination:entrepot_destination_id(*),
          point_vente_destination:point_vente_destination_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bons de livraison:', error);
        throw error;
      }
      
      console.log('Fetched bons de livraison with relations:', data);
      return data as unknown as BonLivraison[];
    }
  });

  const createBonLivraison = useMutation({
    mutationFn: async (newBon: Omit<BonLivraison, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating bon de livraison:', newBon);
      const { data, error } = await supabase
        .from('bons_de_livraison')
        .insert(newBon)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating bon de livraison:', error);
        throw error;
      }
      
      console.log('Bon de livraison created:', data);
      return data as BonLivraison;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-livraison-articles-counts'] });
      toast({
        title: "Bon de livraison créé avec succès",
        variant: "default",
      });
    }
  });

  const updateBonLivraison = useMutation({
    mutationFn: async ({ id, ...bon }: Partial<BonLivraison> & { id: string }) => {
      const { data, error } = await supabase
        .from('bons_de_livraison')
        .update(bon)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BonLivraison;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-livraison-articles-counts'] });
      toast({
        title: "Bon de livraison mis à jour avec succès",
        variant: "default",
      });
    }
  });

  return {
    bonsLivraison,
    isLoading,
    error,
    createBonLivraison,
    updateBonLivraison
  };
};

// Gestion des factures d'achat
export const useFacturesAchat = () => {
  const queryClient = useQueryClient();
  
  const { data: facturesAchat, isLoading, error } = useQuery({
    queryKey: ['factures-achat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('factures_achat')
        .select(`
          *,
          bon_commande:bon_commande_id(*),
          bon_livraison:bon_livraison_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FactureAchat[];
    }
  });

  const createFactureAchat = useMutation({
    mutationFn: async (newFacture: Omit<FactureAchat, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('factures_achat')
        .insert(newFacture)
        .select()
        .single();
      
      if (error) throw error;
      return data as FactureAchat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures-achat'] });
      toast({
        title: "Facture d'achat créée avec succès",
        variant: "default",
      });
    }
  });

  return {
    facturesAchat,
    isLoading,
    error,
    createFactureAchat
  };
};

// Gestion des retours fournisseurs
export const useRetoursFournisseurs = () => {
  const queryClient = useQueryClient();
  
  const { data: retoursFournisseurs, isLoading, error } = useQuery({
    queryKey: ['retours-fournisseurs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retours_fournisseurs')
        .select(`
          *,
          facture_achat:facture_achat_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RetourFournisseur[];
    }
  });

  const createRetourFournisseur = useMutation({
    mutationFn: async (newRetour: Omit<RetourFournisseur, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('retours_fournisseurs')
        .insert(newRetour)
        .select()
        .single();
      
      if (error) throw error;
      return data as RetourFournisseur;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retours-fournisseurs'] });
      toast({
        title: "Retour fournisseur créé avec succès",
        variant: "default",
      });
    }
  });

  return {
    retoursFournisseurs,
    isLoading,
    error,
    createRetourFournisseur
  };
};
