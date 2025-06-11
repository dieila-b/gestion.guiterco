
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  Article, 
  Entrepot, 
  PointDeVente, 
  StockPrincipal, 
  StockPointDeVente, 
  EntreeStock, 
  SortieStock, 
  Transfert 
} from '@/components/stock/types';

// Gestion des entrepôts
export const useEntrepots = () => {
  const queryClient = useQueryClient();
  
  const { data: entrepots, isLoading, error } = useQuery({
    queryKey: ['entrepots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrepots')
        .select('*')
        .order('nom');
      
      if (error) {
        throw error;
      }
      return data as Entrepot[];
    }
  });

  const createEntrepot = useMutation({
    mutationFn: async (newEntrepot: Omit<Entrepot, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('entrepots')
        .insert(newEntrepot)
        .select()
        .single();
      
      if (error) throw error;
      return data as Entrepot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepots'] });
      toast({
        title: "Entrepôt créé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création de l'entrepôt",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateEntrepot = useMutation({
    mutationFn: async ({ id, ...entrepot }: Partial<Entrepot> & { id: string }) => {
      const { data, error } = await supabase
        .from('entrepots')
        .update(entrepot)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Entrepot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepots'] });
      toast({
        title: "Entrepôt mis à jour avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la mise à jour de l'entrepôt",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteEntrepot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('entrepots')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepots'] });
      toast({
        title: "Entrepôt supprimé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la suppression de l'entrepôt",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    entrepots,
    isLoading,
    error,
    createEntrepot,
    updateEntrepot,
    deleteEntrepot
  };
};

// Gestion des points de vente
export const usePointsDeVente = () => {
  const queryClient = useQueryClient();
  
  const { data: pointsDeVente, isLoading, error } = useQuery({
    queryKey: ['points-de-vente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .select('*')
        .order('nom');
      
      if (error) {
        throw error;
      }
      return data as PointDeVente[];
    }
  });

  const createPointDeVente = useMutation({
    mutationFn: async (newPdv: Omit<PointDeVente, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .insert(newPdv)
        .select()
        .single();
      
      if (error) throw error;
      return data as PointDeVente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-de-vente'] });
      toast({
        title: "Point de vente créé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création du point de vente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updatePointDeVente = useMutation({
    mutationFn: async ({ id, ...pdv }: Partial<PointDeVente> & { id: string }) => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .update(pdv)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as PointDeVente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-de-vente'] });
      toast({
        title: "Point de vente mis à jour avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la mise à jour du point de vente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deletePointDeVente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('points_de_vente')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-de-vente'] });
      toast({
        title: "Point de vente supprimé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la suppression du point de vente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    pointsDeVente,
    isLoading,
    error,
    createPointDeVente,
    updatePointDeVente,
    deletePointDeVente
  };
};

// Gestion du catalogue d'articles
export const useCatalogue = () => {
  const queryClient = useQueryClient();
  
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['catalogue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogue')
        .select('*')
        .order('nom');
      
      if (error) {
        throw error;
      }
      return data as Article[];
    }
  });

  const createArticle = useMutation({
    mutationFn: async (newArticle: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('catalogue')
        .insert(newArticle)
        .select()
        .single();
      
      if (error) throw error;
      return data as Article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      toast({
        title: "Article créé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création de l'article",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateArticle = useMutation({
    mutationFn: async ({ id, ...article }: Partial<Article> & { id: string }) => {
      const { data, error } = await supabase
        .from('catalogue')
        .update(article)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      toast({
        title: "Article mis à jour avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la mise à jour de l'article",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('catalogue')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      toast({
        title: "Article supprimé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la suppression de l'article",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    articles,
    isLoading,
    error,
    createArticle,
    updateArticle,
    deleteArticle
  };
};

// Gestion du stock principal (entrepôts)
export const useStockPrincipal = () => {
  const queryClient = useQueryClient();
  
  const { data: stockEntrepot, isLoading, error } = useQuery({
    queryKey: ['stock-principal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_principal')
        .select(`
          *,
          article:article_id(*),
          entrepot:entrepot_id(*)
        `)
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data as StockPrincipal[];
    }
  });

  return {
    stockEntrepot,
    isLoading,
    error
  };
};

// Gestion du stock des points de vente
export const useStockPDV = () => {
  const queryClient = useQueryClient();
  
  const { data: stockPDV, isLoading, error } = useQuery({
    queryKey: ['stock-pdv'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_pdv')
        .select(`
          *,
          article:article_id(*),
          point_vente:point_vente_id(*)
        `)
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data as StockPointDeVente[];
    }
  });

  return {
    stockPDV,
    isLoading,
    error
  };
};

// Gestion des entrées de stock
export const useEntreesStock = () => {
  const queryClient = useQueryClient();
  
  const { data: entrees, isLoading, error } = useQuery({
    queryKey: ['entrees-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrees_stock')
        .select(`
          *,
          article:article_id(*),
          entrepot:entrepot_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data as EntreeStock[];
    }
  });

  const createEntree = useMutation({
    mutationFn: async (newEntree: Omit<EntreeStock, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('entrees_stock')
        .insert(newEntree)
        .select()
        .single();
      
      if (error) throw error;
      return data as EntreeStock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrees-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      toast({
        title: "Entrée de stock créée avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création de l'entrée de stock",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    entrees,
    isLoading,
    error,
    createEntree
  };
};

// Gestion des sorties de stock
export const useSortiesStock = () => {
  const queryClient = useQueryClient();
  
  const { data: sorties, isLoading, error } = useQuery({
    queryKey: ['sorties-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sorties_stock')
        .select(`
          *,
          article:article_id(*),
          entrepot:entrepot_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data as SortieStock[];
    }
  });

  const createSortie = useMutation({
    mutationFn: async (newSortie: Omit<SortieStock, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('sorties_stock')
        .insert(newSortie)
        .select()
        .single();
      
      if (error) throw error;
      return data as SortieStock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sorties-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      toast({
        title: "Sortie de stock créée avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création de la sortie de stock",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    sorties,
    isLoading,
    error,
    createSortie
  };
};

// Gestion des transferts
export const useTransferts = () => {
  const queryClient = useQueryClient();
  
  const { data: transferts, isLoading, error } = useQuery({
    queryKey: ['transferts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transferts')
        .select(`
          *,
          article:article_id(*),
          entrepot_source:entrepots!entrepot_source_id(*),
          entrepot_destination:entrepots!entrepot_destination_id(*),
          pdv_destination:points_de_vente!pdv_destination_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data;
    }
  });

  const createTransfert = useMutation({
    mutationFn: async (newTransfert: Omit<Transfert, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transferts')
        .insert(newTransfert)
        .select()
        .single();
      
      if (error) throw error;
      return data as Transfert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferts'] });
      toast({
        title: "Transfert créé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création du transfert",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateTransfert = useMutation({
    mutationFn: async ({ id, ...transfert }: Partial<Transfert> & { id: string }) => {
      const { data, error } = await supabase
        .from('transferts')
        .update(transfert)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Transfert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferts'] });
      toast({
        title: "Transfert mis à jour avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la mise à jour du transfert",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    transferts,
    isLoading,
    error,
    createTransfert,
    updateTransfert
  };
};
