
export const calculatePaymentStatus = (montantPaye: number, montantTTC: number): string => {
  if (montantPaye === 0) {
    return 'en_attente';
  } else if (montantPaye < montantTTC) {
    return 'partiel';
  } else {
    return 'paye';
  }
};
