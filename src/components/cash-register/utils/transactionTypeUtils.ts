
import { Transaction } from '../types';

export const getTransactionTypeDetails = (source: string | null, type: 'income' | 'expense', description?: string) => {
  console.log('🔍 getTransactionTypeDetails appelée avec:', { source, type, description });
  
  // Première vérification : règlement de facture (paiement d'un solde dû)
  if (source === "facture" || source === "règlement" || source === "Paiement d'un impayé") {
    console.log('✅ Règlement de facture détecté via source !');
    return {
      label: "Règlement Facture",
      className: "bg-orange-50 text-orange-700",
      textColor: "text-orange-700",
      sourceDisplay: "règlement"
    };
  }

  // Deuxième vérification : détection par la description (fallback pour les règlements)
  if (description && (
    description.toLowerCase().includes("règlement") ||
    description.toLowerCase().includes("versement") ||
    description.toLowerCase().includes("impayé") ||
    description.toLowerCase().includes("paiement facture")
  )) {
    console.log('✅ Règlement de facture détecté via description !', description);
    return {
      label: "Règlement Facture",
      className: "bg-orange-50 text-orange-700",
      textColor: "text-orange-700",
      sourceDisplay: "règlement"
    };
  }

  // Troisième vérification : vente immédiate (source explicite)
  if (source === "vente" || source === "Vente encaissée") {
    console.log('✅ Vente immédiate détectée via source');
    return {
      label: "Vente",
      className: "bg-green-50 text-green-700",
      textColor: "text-green-700",
      sourceDisplay: "vente"
    };
  }

  // Quatrième vérification : vente détectée par description
  if (type === 'income' && description && (
    description.toLowerCase().includes("vente") ||
    description.toLowerCase().includes("fa-") // numéro de facture
  )) {
    console.log('✅ Vente détectée via description');
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
        sourceDisplay: "entrée manuelle"
      };
    case 'sortie':
    case 'sortie manuelle':
      return {
        label: 'Sortie',
        className: 'bg-red-50 text-red-700',
        textColor: "text-red-700",
        sourceDisplay: "sortie manuelle"
      };
    default:
      // Logique de fallback
      if (type === 'expense') {
        return { 
          label: 'Sortie', 
          className: 'bg-red-50 text-red-700', 
          textColor: "text-red-700",
          sourceDisplay: "sortie" 
        };
      }
      // Pour les revenus sans classification claire, on assume que c'est une vente
      return { 
        label: 'Vente', 
        className: 'bg-green-50 text-green-700', 
        textColor: "text-green-700",
        sourceDisplay: "vente" 
      };
  }
};
