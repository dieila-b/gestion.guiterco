
import type { FactureVente } from '@/types/sales';
import { openPrintWindow } from './basePrintService';
import { generateFactureVenteContent } from './factureVente/contentGenerator';

export const printFactureVente = (facture: FactureVente): void => {
  const content = generateFactureVenteContent(facture);
  openPrintWindow(content, `Facture ${facture.numero_facture}`);
};
