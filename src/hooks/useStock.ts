
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

// Gestion du stock principal (entrepôts) - Version améliorée
export const useStockPrincipal = () => {
  const queryClient = useQueryClient();
  
  const { data: stockEntrepot, isLoading, error } = useQuery({
    queryKey: ['stock-principal'],
    queryFn: async () => {
      console.log('Fetching stock principal data with improved relations...');
      
      const { data, error } = await supabase
        .from('stock_principal')
        .select(`
          *,
          article:catalogue!inner(
            id,
            reference,
            nom,
            description,
            categorie,
            unite_mesure,
            prix_unitaire,
            prix_achat,
            prix_vente,
            statut,
            seuil_alerte,
            created_at,
            updated_at
          ),
          entrepot:entrepots!inner(
            id,
            nom,
            adresse,
            gestionnaire,
            statut,
            capacite_max,
            created_at,
            updated_at
          )
        `)
        .eq('article.statut', 'actif')
        .eq('entrepot.statut', 'actif')
        .gt('quantite_disponible', 0)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors du chargement du stock principal:', error);
        throw error;
      }
      
      console.log('Stock principal data loaded with relations:', data);
      return data as StockPrincipal[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes pour des données plus fraîches
    refetchOnWindowFocus: true, // Rafraîchir quand on revient sur la fenêtre
    refetchInterval: 5 * 60 * 1000 // Rafraîchir automatiquement toutes les 5 minutes
  });

  // Fonction pour forcer le rafraîchissement
  const refreshStock = () => {
    queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
    queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    queryClient.invalidateQueries({ queryKey: ['entrepots'] });
  };

  return {
    stockEntrepot,
    isLoading,
    error,
    refreshStock
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
          article:catalogue!inner(
            id,
            reference,
            nom,
            description,
            categorie,
            unite_mesure,
            prix_unitaire,
            prix_achat,
            prix_vente,
            statut,
            seuil_alerte,
            created_at,
            updated_at
          ),
          entrepot_source:entrepots!entrepot_source_id(
            id,
            nom,
            adresse,
            gestionnaire,
            statut,
            capacite_max,
            created_at,
            updated_at
          ),
          entrepot_destination:entrepots!entrepot_destination_id(
            id,
            nom,
            adresse,
            gestionnaire,
            statut,
            capacite_max,
            created_at,
            updated_at
          ),
          pdv_destination:points_de_vente!pdv_destination_id(
            id,
            nom,
            adresse,
            responsable,
            statut,
            type_pdv,
            created_at,
            updated_at
          )
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
      // Récupérer les détails du transfert avant la mise à jour
      const { data: currentTransfert } = await supabase
        .from('transferts')
        .select(`
          *,
          article:catalogue!inner(id, nom)
        `)
        .eq('id', id)
        .single();

      if (!currentTransfert) throw new Error('Transfert non trouvé');

      // Mettre à jour le transfert
      const { data, error } = await supabase
        .from('transferts')
        .update(transfert)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Si le statut passe à 'expedie', débiter l'entrepôt source
      if (transfert.statut === 'expedie' && currentTransfert.statut !== 'expedie') {
        await handleStockMovement(currentTransfert, 'expedie');
      }

      // Si le statut passe à 'recu', créditer la destination
      if (transfert.statut === 'recu' && currentTransfert.statut !== 'recu') {
        await handleStockMovement(currentTransfert, 'recu');
      }

      return data as Transfert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferts'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
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

  // Fonction pour gérer les mouvements de stock
  const handleStockMovement = async (transfert: any, newStatus: string) => {
    try {
      if (newStatus === 'expedie') {
        // Débiter l'entrepôt source
        await supabase
          .from('sorties_stock')
          .insert({
            article_id: transfert.article_id,
            entrepot_id: transfert.entrepot_source_id,
            quantite: transfert.quantite,
            type_sortie: 'transfert',
            destination: transfert.entrepot_destination_id ? 'Entrepôt' : 'Point de vente',
            numero_bon: `TRF-${transfert.numero_transfert || transfert.id.slice(0, 8)}`,
            observations: `Transfert expédié vers ${transfert.entrepot_destination_id ? 'entrepôt' : 'PDV'}`,
            created_by: transfert.created_by || 'Système'
          });

        console.log(`Stock débité de l'entrepôt source pour le transfert ${transfert.id}`);
      }

      if (newStatus === 'recu') {
        if (transfert.entrepot_destination_id) {
          // Créditer l'entrepôt destination
          await supabase
            .from('entrees_stock')
            .insert({
              article_id: transfert.article_id,
              entrepot_id: transfert.entrepot_destination_id,
              quantite: transfert.quantite,
              type_entree: 'transfert',
              numero_bon: `TRF-${transfert.numero_transfert || transfert.id.slice(0, 8)}`,
              fournisseur: 'Transfert interne',
              observations: `Transfert reçu de l'entrepôt source`,
              created_by: transfert.created_by || 'Système'
            });

          console.log(`Stock crédité à l'entrepôt destination pour le transfert ${transfert.id}`);
        } else if (transfert.pdv_destination_id) {
          // Créditer le point de vente
          const { data: existingStock } = await supabase
            .from('stock_pdv')
            .select('*')
            .eq('article_id', transfert.article_id)
            .eq('point_vente_id', transfert.pdv_destination_id)
            .single();

          if (existingStock) {
            // Mettre à jour le stock existant
            await supabase
              .from('stock_pdv')
              .update({
                quantite_disponible: existingStock.quantite_disponible + transfert.quantite,
                derniere_livraison: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('article_id', transfert.article_id)
              .eq('point_vente_id', transfert.pdv_destination_id);
          } else {
            // Créer une nouvelle entrée de stock
            await supabase
              .from('stock_pdv')
              .insert({
                article_id: transfert.article_id,
                point_vente_id: transfert.pdv_destination_id,
                quantite_disponible: transfert.quantite,
                quantite_minimum: 5,
                derniere_livraison: new Date().toISOString()
              });
          }

          console.log(`Stock crédité au point de vente pour le transfert ${transfert.id}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du mouvement de stock:', error);
      throw error;
    }
  };

  return {
    transferts,
    isLoading,
    error,
    createTransfert,
    updateTransfert
  };
};
