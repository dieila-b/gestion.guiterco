
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { CartItem } from './types';

export const useCartManagement = (
  checkStock: (articleId: string, quantiteDemandee: number) => { disponible: boolean; quantiteDisponible: number },
  updateLocalStock?: (articleId: string, quantityUsed: number) => void
) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((article: any) => {
    const stockCheck = checkStock(article.id, 1);
    
    if (!stockCheck.disponible) {
      toast.error('Quantité insuffisante en stock');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === article.id);
      
      if (existingItem) {
        const nouvelleQuantite = existingItem.quantite + 1;
        const stockCheckNouvelle = checkStock(article.id, nouvelleQuantite);
        
        if (!stockCheckNouvelle.disponible) {
          toast.error('Quantité insuffisante en stock');
          return prevCart;
        }
        
        // Mettre à jour le stock local visuellement
        if (updateLocalStock) {
          updateLocalStock(article.id, 1);
        }
        
        return prevCart.map(item =>
          item.id === article.id
            ? { 
                ...item, 
                quantite: nouvelleQuantite,
                prix_final: (item.prix_unitaire_brut - (item.remise_unitaire || 0)) * nouvelleQuantite
              }
            : item
        );
      }
      
      // Mettre à jour le stock local visuellement pour un nouvel article
      if (updateLocalStock) {
        updateLocalStock(article.id, 1);
      }
      
      const newItem: CartItem = {
        id: article.id,
        article_id: article.id,
        nom: article.nom,
        reference: article.reference || '',
        prix_unitaire_brut: article.prix_vente || 0, // Utiliser prix_unitaire_brut
        quantite: 1,
        remise_unitaire: 0,
        prix_final: article.prix_vente || 0,
        stock_disponible: stockCheck.quantiteDisponible,
        prix_vente: article.prix_vente
      };
      
      return [...prevCart, newItem];
    });
  }, [checkStock, updateLocalStock]);

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Restaurer le stock local avant de supprimer l'article
      const item = cart.find(item => item.id === productId);
      if (item && updateLocalStock) {
        updateLocalStock(productId, -item.quantite);
      }
      
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
      return;
    }

    const currentItem = cart.find(item => item.id === productId);
    if (!currentItem) return;

    const stockCheck = checkStock(productId, newQuantity);
    
    if (!stockCheck.disponible) {
      toast.error(`Quantité insuffisante. Stock disponible: ${stockCheck.quantiteDisponible}`);
      return;
    }

    // Calculer la différence pour ajuster le stock local
    const quantityDifference = newQuantity - currentItem.quantite;
    if (updateLocalStock && quantityDifference !== 0) {
      updateLocalStock(productId, quantityDifference);
    }

    setCart(prevCart => 
      prevCart.map(item =>
        item.id === productId
          ? { 
              ...item, 
              quantite: newQuantity,
              prix_final: (item.prix_unitaire_brut - (item.remise_unitaire || 0)) * newQuantity
            }
          : item
      )
    );
  }, [checkStock, updateLocalStock, cart]);

  const updateRemise = useCallback((productId: string, remise: number) => {
    setCart(prevCart => 
      prevCart.map(item =>
        item.id === productId
          ? { 
              ...item, 
              remise_unitaire: Math.max(0, remise),
              prix_final: (item.prix_unitaire_brut - Math.max(0, remise)) * item.quantite
            }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    // Restaurer le stock local avant de supprimer
    const item = cart.find(item => item.id === productId);
    if (item && updateLocalStock) {
      updateLocalStock(productId, -item.quantite);
    }
    
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, [updateLocalStock, cart]);

  const clearCart = useCallback(() => {
    // Restaurer tout le stock local
    if (updateLocalStock) {
      cart.forEach(item => {
        updateLocalStock(item.id, -item.quantite);
      });
    }
    
    setCart([]);
  }, [updateLocalStock, cart]);

  return {
    cart,
    setCart,
    addToCart,
    updateQuantity,
    updateRemise,
    removeFromCart,
    clearCart
  };
};
