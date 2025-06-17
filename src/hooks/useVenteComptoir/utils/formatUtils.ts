
// Utility functions for formatting
export const generateFactureNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4);
  return `FA-${year}-${month}-${day}-${timestamp}`;
};

export const determineStatutPaiement = (montantTotal: number, montantPaye: number) => {
  const montantRestant = montantTotal - montantPaye;
  let statutPaiement = 'en_attente';
  
  // Logique précise pour les statuts de paiement
  if (montantPaye === 0) {
    statutPaiement = 'en_attente';
  } else if (montantPaye >= montantTotal) {
    statutPaiement = 'payee';
  } else if (montantPaye > 0 && montantPaye < montantTotal) {
    statutPaiement = 'partiellement_payee';
  }

  console.log('🔍 Détermination statut:', {
    montantTotal,
    montantPaye,
    montantRestant,
    statutPaiement
  });

  return { statutPaiement, montantRestant };
};
