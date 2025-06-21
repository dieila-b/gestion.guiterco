
export const calculatePaymentStatus = (nouveauTotal: number, montantTtc: number) => {
  let nouveauStatutPaiement = 'en_attente';
  
  if (nouveauTotal >= montantTtc) {
    nouveauStatutPaiement = 'payee';
  } else if (nouveauTotal > 0) {
    nouveauStatutPaiement = 'partiellement_payee';
  }
  
  return nouveauStatutPaiement;
};
