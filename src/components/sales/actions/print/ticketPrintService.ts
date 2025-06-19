
import type { FactureVente } from '@/types/sales';
import { openPrintWindow } from './basePrintService';
import { 
  calculateTotalPaid, 
  calculateRemainingAmount, 
  generateTicketNumber, 
  getCurrentDateTime 
} from './printUtils';
import { getActualDeliveryStatus } from '@/components/sales/table/StatusUtils';

const generateTicketStyles = (): string => {
  return `
    <style>
      body { 
        font-family: 'Courier New', monospace; 
        width: 280px; 
        margin: 0 auto; 
        font-size: 12px; 
        line-height: 1.2;
        padding: 10px;
        background: white;
        text-align: center;
      }
      .header {
        text-align: center;
        margin-bottom: 15px;
      }
      .logo {
        width: 60px;
        height: 60px;
        margin: 0 auto 8px auto;
        display: block;
      }
      .shop-name {
        font-size: 16px;
        font-weight: bold;
        margin: 5px 0;
        letter-spacing: 1px;
      }
      .shop-subtitle {
        font-size: 10px;
        color: #666;
        margin-bottom: 5px;
      }
      .shop-info {
        font-size: 11px;
        margin-bottom: 15px;
      }
      .center { text-align: center; }
      .left { text-align: left; }
      .right { text-align: right; }
      .bold { font-weight: bold; }
      .red { color: #d32f2f; }
      .line { 
        border-top: 1px dashed #000; 
        margin: 8px 0; 
        width: 100%;
      }
      .ticket-header {
        margin: 15px 0;
        font-size: 11px;
      }
      .articles-table {
        width: 100%;
        margin: 10px 0;
        font-size: 11px;
      }
      .article-line {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
        text-align: left;
        align-items: center;
      }
      .article-qty {
        width: 15px;
        flex-shrink: 0;
        font-size: 10px;
      }
      .article-name {
        flex: 1;
        padding: 0 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 10px;
      }
      .article-price {
        width: 50px;
        text-align: right;
        flex-shrink: 0;
        font-size: 10px;
      }
      .article-total {
        width: 50px;
        text-align: right;
        flex-shrink: 0;
        font-size: 10px;
      }
      .totals {
        margin: 15px 0;
        font-size: 12px;
      }
      .total-line {
        display: flex;
        justify-content: space-between;
        margin: 3px 0;
        padding: 0 5px;
      }
      .grand-total {
        font-weight: bold;
        font-size: 14px;
        border-top: 1px solid #000;
        padding-top: 5px;
        margin-top: 8px;
      }
      .payment-info {
        font-size: 11px;
        margin: 5px 0;
      }
      .remaining-amount {
        color: #d32f2f;
        font-weight: bold;
      }
      .delivery-status {
        font-size: 11px;
        margin: 8px 0;
        padding: 5px;
        border: 1px dashed #666;
      }
      .footer {
        margin-top: 15px;
        font-size: 11px;
        font-weight: bold;
      }
      .datetime {
        font-size: 10px;
        margin: 10px 0;
      }
      @media print {
        body { width: 280px; margin: 0; }
      }
    </style>
  `;
};

const generateArticlesSection = (facture: FactureVente): string => {
  if (facture.lignes_facture && facture.lignes_facture.length > 0) {
    return facture.lignes_facture.map((ligne, index) => `
      <div class="article-line">
        <span class="article-qty">${ligne.quantite}</span>
        <span class="article-name">${ligne.article?.nom || 'Article'}</span>
        <span class="article-price">${Math.round(ligne.prix_unitaire)}</span>
        <span class="article-total">${Math.round(ligne.montant_ligne)}</span>
      </div>
    `).join('');
  }
  
  return `
    <div class="article-line">
      <span class="article-qty">1</span>
      <span class="article-name">Vente globale</span>
      <span class="article-price">${Math.round(facture.montant_ttc)}</span>
      <span class="article-total">${Math.round(facture.montant_ttc)}</span>
    </div>
  `;
};

const generatePaymentSection = (facture: FactureVente, totalPaid: number, remainingAmount: number): string => {
  let paymentHtml = '';
  
  if (totalPaid > 0) {
    paymentHtml += `
      <div class="total-line payment-info">
        <span>Montant payé</span>
        <span>${Math.round(totalPaid)} F</span>
      </div>
    `;
  }
  
  if (remainingAmount > 0) {
    paymentHtml += `
      <div class="total-line payment-info remaining-amount">
        <span>Reste à payer</span>
        <span>${Math.round(remainingAmount)} F</span>
      </div>
    `;
  }
  
  return paymentHtml;
};

const generateDeliverySection = (facture: FactureVente): string => {
  const deliveryStatus = getActualDeliveryStatus(facture);
  
  if (deliveryStatus === 'livree') {
    return `
      <div class="delivery-status">
        <div class="bold">Statut : Livré</div>
      </div>
    `;
  } else if (deliveryStatus === 'partiellement_livree') {
    const totalQuantiteCommandee = facture.lignes_facture?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0;
    const totalQuantiteLivree = facture.lignes_facture?.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0) || 0;
    const articlesRestants = totalQuantiteCommandee - totalQuantiteLivree;
    
    return `
      <div class="delivery-status">
        <div class="bold">Statut : Partiel</div>
        <div>Articles livrés : ${totalQuantiteLivree} | Restants : ${articlesRestants}</div>
      </div>
    `;
  }
  
  return '';
};

const generateTicketContent = (facture: FactureVente): string => {
  const totalPaid = calculateTotalPaid(facture);
  const remainingAmount = calculateRemainingAmount(facture);
  const ticketNumber = generateTicketNumber(facture);
  const { dateStr, timeStr } = getCurrentDateTime();

  return `
    <html>
      <head>
        <title>Ticket ${ticketNumber}</title>
        ${generateTicketStyles()}
      </head>
      <body>
        <div class="header">
          <img src="/lovable-uploads/932def2b-197f-4495-8a0a-09c753a4a892.png" alt="U CONNEXT Logo" class="logo">
          <div class="shop-name">U CONNEXT</div>
          <div class="shop-subtitle">Universal conNext</div>
          <div class="shop-info">Tel : +225 05 55 95 45 33</div>
        </div>
        
        <div class="line"></div>
        
        <div class="ticket-header">
          <div>Client : ${facture.client?.nom || 'Client Comptoir'}</div>
          <div>Ticket : ${ticketNumber}</div>
        </div>
        
        <div class="line"></div>
        
        <div class="articles-table">
          ${generateArticlesSection(facture)}
        </div>
        
        <div class="line"></div>
        
        <div class="totals">
          <div class="total-line grand-total">
            <span>Total</span>
            <span>${Math.round(facture.montant_ttc)} F</span>
          </div>
          
          ${generatePaymentSection(facture, totalPaid, remainingAmount)}
        </div>
        
        ${generateDeliverySection(facture)}
        
        <div class="center datetime">${dateStr} ${timeStr}</div>
        <div class="center footer">Merci à la prochaine</div>
      </body>
    </html>
  `;
};

export const printTicket = (facture: FactureVente): void => {
  const content = generateTicketContent(facture);
  openPrintWindow(content, `Ticket ${generateTicketNumber(facture)}`);
};
