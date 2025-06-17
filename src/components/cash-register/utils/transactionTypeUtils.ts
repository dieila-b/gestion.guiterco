
import { Transaction } from '../types';

export const getTransactionTypeDetails = (source: string | null, type: 'income' | 'expense') => {
  console.log('🔍 getTransactionTypeDetails appelée avec:', { source, type });
  
  // Logique conditionnelle exacte demandée par l'utilisateur
  if (source === "facture") {
    console.log('✅ Règlement de facture détecté !');
    return {
      label: "Règlement",
      className: "bg-orange-50 text-orange-700",
      textColor: "text-orange-700",
      sourceDisplay: "Règlement facture"
    };
  }

  // Pour toutes les autres transactions, c'est une vente (si income) ou autre
  if (type === 'income') {
    console.log('✅ Vente détectée');
    return {
      label: "Vente",
      className: "bg-green-50 text-green-700",
      textColor: "text-green-700",
      sourceDisplay: "vente"
    };
  }

  // Gestion des autres types (entrées manuelles, sorties, etc.)
  const normalizedSource = source?.trim().toLowerCase();
  
  switch (normalizedSource) {
    case 'entrée manuelle':
      return {
        label: 'Entrée',
        className: 'bg-blue-50 text-blue-700',
        textColor: "text-blue-700",
        sourceDisplay: source
      };
    case 'sortie':
    case 'sortie manuelle':
      return {
        label: 'Sortie',
        className: 'bg-red-50 text-red-700',
        textColor: "text-red-700",
        sourceDisplay: source
      };
    default:
      // Logique de fallback
      if (type === 'expense') {
        return { 
          label: 'Sortie', 
          className: 'bg-red-50 text-red-700', 
          textColor: "text-red-700",
          sourceDisplay: source 
        };
      }
      return { 
        label: 'Entrée', 
        className: 'bg-blue-50 text-blue-700', 
        textColor: "text-blue-700",
        sourceDisplay: source 
      };
  }
};
