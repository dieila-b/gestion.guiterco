
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { CartItem, VenteComptoirData } from './types';

export const useVenteComptoir = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [client, setClient] = useState<string>('');
  const [modePaiement, setModePaiement] = useState<string>('especes');

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantite: cartItem.quantite + item.quantite }
            : cartItem
        );
      }
      return [...prev, item];
    });
    toast.success('Article ajouté au panier');
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    toast.success('Article retiré du panier');
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantite: quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setClient('');
    setModePaiement('especes');
    toast.success('Panier vidé');
  }, []);

  const calculateTotals = useCallback(() => {
    const montantHT = cart.reduce((total, item) => {
      const prixUnitaire = item.prix_final || item.prix_unitaire;
      return total + (prixUnitaire * item.quantite);
    }, 0);

    const tva = montantHT * 0.20; // 20% TVA par défaut
    const montantTTC = montantHT + tva;

    return {
      montant_ht: Number(montantHT.toFixed(2)),
      tva: Number(tva.toFixed(2)),
      montant_ttc: Number(montantTTC.toFixed(2))
    };
  }, [cart]);

  const prepareSaleData = useCallback((): VenteComptoirData | null => {
    if (cart.length === 0 || !client) {
      toast.error('Veuillez ajouter des articles et sélectionner un client');
      return null;
    }

    const totals = calculateTotals();
    
    return {
      client_id: client,
      cart: cart.map(item => ({
        ...item,
        prix_final: item.prix_final || item.prix_unitaire
      })),
      montant_ht: totals.montant_ht,
      tva: totals.tva,
      montant_ttc: totals.montant_ttc,
      mode_paiement: modePaiement,
      point_vente_id: 'default-pdv', // À adapter selon votre logique
      payment_data: {
        montant_paye: totals.montant_ttc,
        mode_paiement: modePaiement,
        statut_livraison: 'livree',
        statut_paiement: 'paye',
        quantite_livree: cart.reduce((acc, item) => ({
          ...acc,
          [item.id]: item.quantite
        }), {}),
        notes: 'Vente au comptoir'
      }
    };
  }, [cart, client, modePaiement, calculateTotals]);

  return {
    // État
    cart,
    client,
    modePaiement,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setClient,
    setModePaiement,
    
    // Calculs
    calculateTotals,
    prepareSaleData,
    
    // Propriétés dérivées
    itemCount: cart.reduce((total, item) => total + item.quantite, 0),
    isEmpty: cart.length === 0
  };
};
