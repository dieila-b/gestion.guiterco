
import type { FactureVente } from '@/types/sales';

export const printFacture = (facture: FactureVente) => {
  const printContent = `
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

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }
};

export const printTicket = (facture: FactureVente) => {
  const ticketContent = `
    <html>
      <head>
        <title>Ticket ${facture.numero_facture}</title>
        <style>
          body { font-family: monospace; width: 300px; margin: 0 auto; font-size: 12px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="center bold">
          TICKET DE CAISSE
        </div>
        <div class="line"></div>
        <div class="center">
          ${facture.numero_facture}
        </div>
        <div class="line"></div>
        <p>Date: ${new Date(facture.date_facture).toLocaleDateString('fr-FR')}</p>
        <p>Client: ${facture.client?.nom || 'Client'}</p>
        <div class="line"></div>
        <p class="bold">Total: ${facture.montant_ttc.toFixed(2)} €</p>
        <div class="line"></div>
        <div class="center">
          Merci de votre visite !
        </div>
      </body>
    </html>
  `;

  const ticketWindow = window.open('', '_blank');
  if (ticketWindow) {
    ticketWindow.document.write(ticketContent);
    ticketWindow.document.close();
    ticketWindow.print();
  }
};
