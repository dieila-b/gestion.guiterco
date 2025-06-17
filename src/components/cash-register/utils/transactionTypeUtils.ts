
import { Transaction } from '../types';

export const getTransactionTypeDetails = (source: string | null, type: 'income' | 'expense', description?: string) => {
  console.log('🔍 getTransactionTypeDetails appelée avec:', { source, type, description });
  
  // Première vérification : si source est explicitement "facture"
  if (source === "facture") {
    console.log('✅ Règlement de facture détecté via source !');
    return {
      label: "Règlement",
      className: "bg-orange-50 text-orange-700",
      textColor: "text-orange-700",
      sourceDisplay: "Règlement facture"
    };
  }

  // Deuxième vérification : détection par la description (fallback)
  if (description && description.toLowerCase().includes("règlement")) {
    console.log('✅ Règlement de facture détecté via description !', description);
    return {
      label: "Règlement",
      className: "bg-orange-50 text-orange-700",
      textColor: "text-orange-700",
      sourceDisplay: "Règlement facture"
    };
  }

  // Pour les revenus qui ne sont pas des règlements, c'est une vente
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
