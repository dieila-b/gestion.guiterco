
import type { FactureVente } from '@/types/sales';

export const calculateTotalPaid = (facture: FactureVente): number => {
  return facture.versements?.reduce((sum, versement) => sum + versement.montant, 0) || 0;
};

export const calculateRemainingAmount = (facture: FactureVente): number => {
  const totalPaid = calculateTotalPaid(facture);
  return Math.max(0, facture.montant_ttc - totalPaid);
};

export const generateTicketNumber = (facture: FactureVente): string => {
  return facture.numero_facture.replace('FA-', '').replace(/-/g, '');
};

export const getCurrentDateTime = (): { dateStr: string; timeStr: string } => {
  const now = new Date();
  return {
    dateStr: now.toLocaleDateString('fr-FR'),
    timeStr: now.toLocaleTimeString('fr-FR')
  };
};
