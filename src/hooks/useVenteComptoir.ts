
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useCallback } from 'react';

interface CartItem {
  id: string;
  nom: string;
  prix_vente: number;
  quantite: number;
  remise: number;
}

interface VenteComptoirData {
  client_id: string;
  point_vente: string;
  articles: CartItem[];
  montant_total: number;
}

export const useVenteComptoir = () => {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);

  // Mutation pour créer une vente
  const createVente = useMutation({
    mutationFn: async (venteData: VenteComptoirData) => {
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
          mode_paiement: 'comptant'
        })
        .select()
        .single();

      if (commandeError) throw commandeError;

      // Créer les lignes de commande
      const lignesCommande = venteData.articles.map(article => ({
        commande_id: commande.id,
        article_id: article.id,
        quantite: article.quantite,
        prix_unitaire: article.prix_vente * (1 - article.remise / 100),
        montant_ligne: (article.prix_vente * (1 - article.remise / 100)) * article.quantite
      }));

      const { error: lignesError } = await supabase
        .from('lignes_commande')
        .insert(lignesCommande);

      if (lignesError) throw lignesError;

      // Créer la facture automatiquement
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
          statut_paiement: 'paye',
          mode_paiement: 'comptant'
        })
        .select()
        .single();

      if (factureError) throw factureError;

      return { commande, facture };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes_clients'] });
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv'] });
      setCart([]);
    }
  });

  // Fonctions de gestion du panier
  const addToCart = useCallback((article: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === article.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === article.id
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      }
      
      return [...prevCart, {
        id: article.id,
        nom: article.nom,
        prix_vente: article.prix_vente || 0,
        quantite: 1,
        remise: 0
      }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    } else {
      setCart(prevCart => 
        prevCart.map(item =>
          item.id === productId
            ? { ...item, quantite: newQuantity }
            : item
        )
      );
    }
  }, []);

  const updateRemise = useCallback((productId: string, remise: number) => {
    setCart(prevCart => 
      prevCart.map(item =>
        item.id === productId
          ? { ...item, remise: Math.min(100, Math.max(0, remise)) }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    addToCart,
    updateQuantity,
    updateRemise,
    removeFromCart,
    clearCart,
    createVente,
    isLoading: createVente.isPending
  };
};
