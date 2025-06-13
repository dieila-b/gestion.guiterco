
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { CartItem } from './types';

export const useCartManagement = (checkStock: (articleId: string, quantiteDemandee: number) => { disponible: boolean; quantiteDisponible: number }) => {
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
        
        return prevCart.map(item =>
          item.id === article.id
            ? { ...item, quantite: nouvelleQuantite }
            : item
        );
      }
      
      return [...prevCart, {
        id: article.id,
        nom: article.nom,
        prix_vente: article.prix_vente || 0,
        quantite: 1,
        remise: 0,
        stock_disponible: stockCheck.quantiteDisponible
      }];
    });
  }, [checkStock]);

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
      return;
    }

    const stockCheck = checkStock(productId, newQuantity);
    
    if (!stockCheck.disponible) {
      toast.error(`Quantité insuffisante. Stock disponible: ${stockCheck.quantiteDisponible}`);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantite: newQuantity }
          : item
      )
    );
  }, [checkStock]);

  const updateRemise = useCallback((productId: string, remise: number) => {
    setCart(prevCart => 
      prevCart.map(item =>
        item.id === productId
          ? { ...item, remise: Math.max(0, remise) }
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
    setCart,
    addToCart,
    updateQuantity,
    updateRemise,
    removeFromCart,
    clearCart
  };
};
