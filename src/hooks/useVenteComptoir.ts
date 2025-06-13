
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  nom: string;
  prix_vente: number;
  quantite: number;
  remise: number; // Remise en montant fixe
  stock_disponible?: number;
}

interface VenteComptoirData {
  client_id: string;
  point_vente: string;
  articles: CartItem[];
  montant_total: number;
  montant_paye: number;
  mode_paiement: string;
  statut_livraison: string;
  quantite_livree?: { [key: string]: number };
  notes?: string;
}

export const useVenteComptoir = (selectedPDV?: string) => {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);

  // Hook pour récupérer le stock PDV
  const { data: stockPDV } = useQuery({
    queryKey: ['stock_pdv', selectedPDV],
    queryFn: async () => {
      if (!selectedPDV) return [];
      
      const { data, error } = await supabase
        .from('stock_pdv')
        .select(`
          *,
          article:catalogue!inner(id, nom, prix_vente),
          point_vente:points_de_vente!inner(nom)
        `)
        .eq('point_vente_id', selectedPDV);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPDV
  });

  // Fonction pour vérifier le stock disponible
  const checkStock = useCallback((articleId: string, quantiteDemandee: number) => {
    const stockItem = stockPDV?.find(item => item.article_id === articleId);
    if (!stockItem) return { disponible: false, quantiteDisponible: 0 };
    
    return {
      disponible: stockItem.quantite_disponible >= quantiteDemandee,
      quantiteDisponible: stockItem.quantite_disponible
    };
  }, [stockPDV]);

  // Fonction pour obtenir la couleur selon le stock
  const getStockColor = useCallback((quantite: number) => {
    if (quantite > 50) return 'text-green-600';
    if (quantite >= 10) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  // Mutation pour créer une vente avec gestion des paiements et livraisons
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
          mode_paiement: venteData.mode_paiement
        })
        .select()
        .single();

      if (commandeError) throw commandeError;

      // Créer les lignes de commande
      const lignesCommande = venteData.articles.map(article => {
        const prixApresRemise = Math.max(0, article.prix_vente - article.remise);
        return {
          commande_id: commande.id,
          article_id: article.id,
          quantite: article.quantite,
          prix_unitaire: prixApresRemise,
          montant_ligne: prixApresRemise * article.quantite
        };
      });

      const { error: lignesError } = await supabase
        .from('lignes_commande')
        .insert(lignesCommande);

      if (lignesError) throw lignesError;

      // Créer la facture
      const numeroFacture = `FA-${Date.now()}`;
      const statutPaiement = venteData.montant_paye >= venteData.montant_total ? 'paye' : 'partiel';
      
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .insert({
          numero_facture: numeroFacture,
          commande_id: commande.id,
          client_id: venteData.client_id,
          montant_ttc: venteData.montant_total,
          montant_ht: venteData.montant_total / 1.2,
          tva: venteData.montant_total - (venteData.montant_total / 1.2),
          statut_paiement: statutPaiement,
          mode_paiement: venteData.mode_paiement
        })
        .select()
        .single();

      if (factureError) throw factureError;

      // Enregistrer le versement si paiement effectué
      if (venteData.montant_paye > 0) {
        const { error: versementError } = await supabase
          .from('versements_clients')
          .insert({
            numero_versement: `VER-${Date.now()}`,
            client_id: venteData.client_id,
            facture_id: facture.id,
            montant: venteData.montant_paye,
            mode_paiement: venteData.mode_paiement,
            observations: venteData.notes
          });

        if (versementError) throw versementError;
      }

      // Mettre à jour le stock PDV
      for (const article of venteData.articles) {
        const { error: stockError } = await supabase
          .from('stock_pdv')
          .update({
            quantite_disponible: supabase.raw(`quantite_disponible - ${article.quantite}`)
          })
          .eq('article_id', article.id)
          .eq('point_vente_id', selectedPDV);

        if (stockError) throw stockError;
      }

      return { commande, facture };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes_clients'] });
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv'] });
      setCart([]);
      toast.success('Vente enregistrée avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la vente:', error);
      toast.error('Erreur lors de l\'enregistrement de la vente');
    }
  });

  // Fonctions de gestion du panier avec vérification de stock
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
    stockPDV,
    addToCart,
    updateQuantity,
    updateRemise,
    removeFromCart,
    clearCart,
    createVente,
    checkStock,
    getStockColor,
    isLoading: createVente.isPending
  };
};
