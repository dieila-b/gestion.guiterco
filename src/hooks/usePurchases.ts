
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BonCommande, BonLivraison, FactureAchat, RetourFournisseur } from '@/types/purchases';

// Gestion des bons de commande
export const useBonsCommande = () => {
  const queryClient = useQueryClient();
  
  const { data: bonsCommande, isLoading, error } = useQuery({
    queryKey: ['bons-commande'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bons_de_commande')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BonCommande[];
    }
  });

  const createBonCommande = useMutation({
    mutationFn: async (newBon: Omit<BonCommande, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('bons_de_commande')
        .insert(newBon)
        .select()
        .single();
      
      if (error) throw error;
      return data as BonCommande;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
      toast({
        title: "Bon de commande créé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création du bon de commande",
        description: error.message,
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
      toast({
        title: "Bon de commande mis à jour avec succès",
        variant: "default",
      });
    }
  });

  const deleteBonCommande = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bons_de_commande')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-commande'] });
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
      const { data, error } = await supabase
        .from('bons_de_livraison')
        .select(`
          *,
          bon_commande:bon_commande_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BonLivraison[];
    }
  });

  const createBonLivraison = useMutation({
    mutationFn: async (newBon: Omit<BonLivraison, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('bons_de_livraison')
        .insert(newBon)
        .select()
        .single();
      
      if (error) throw error;
      return data as BonLivraison;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      toast({
        title: "Bon de livraison créé avec succès",
        variant: "default",
      });
    }
  });

  return {
    bonsLivraison,
    isLoading,
    error,
    createBonLivraison
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
