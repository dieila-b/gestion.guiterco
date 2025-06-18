
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};
