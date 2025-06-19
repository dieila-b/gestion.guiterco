
import type { FactureVente } from '@/types/sales';
import { openPrintWindow } from './basePrintService';

const generateFactureContent = (facture: FactureVente): string => {
  return `
    <html>
      <head>
        <title>Facture ${facture.numero_facture}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FACTURE DE VENTE</h1>
          <h2>${facture.numero_facture}</h2>
        </div>
        <div class="info">
          <p><strong>Date:</strong> ${new Date(facture.date_facture).toLocaleDateString('fr-FR')}</p>
          <p><strong>Client:</strong> ${facture.client?.nom || 'Client non spécifié'}</p>
          <p><strong>Statut:</strong> ${facture.statut_paiement}</p>
        </div>
        <div class="total">
          <p>Total HT: ${facture.montant_ht.toFixed(2)} €</p>
          <p>TVA: ${facture.tva.toFixed(2)} €</p>
          <p>Total TTC: ${facture.montant_ttc.toFixed(2)} €</p>
        </div>
      </body>
    </html>
  `;
};

export const printFacture = (facture: FactureVente): void => {
  const content = generateFactureContent(facture);
  openPrintWindow(content, `Facture ${facture.numero_facture}`);
};
