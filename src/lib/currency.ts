
// Utilitaire pour le formatage de la devise GNF
export const formatCurrency = (amount: number): string => {
  // Arrondir aux entiers
  const roundedAmount = Math.round(amount);
  
  // Formater avec séparateurs de milliers et devise GNF
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(roundedAmount);
};

// Alternative sans symbole de devise pour certains cas
export const formatAmount = (amount: number): string => {
  const roundedAmount = Math.round(amount);
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(roundedAmount);
};
