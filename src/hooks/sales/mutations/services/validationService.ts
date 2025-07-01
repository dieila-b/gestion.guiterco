
import type { CreateFactureVenteData } from '../types';

export const validateFactureData = (data: CreateFactureVenteData) => {
  console.log('🔍 Validation des données de facture:', data);
  
  if (!data.client_id) {
    throw new Error('Client ID est requis');
  }
  
  if (!data.cart || data.cart.length === 0) {
    throw new Error('Le panier ne peut pas être vide');
  }
  
  if (data.montant_ttc <= 0) {
    throw new Error('Le montant TTC doit être supérieur à 0');
  }
  
  console.log('✅ Validation réussie');
};
