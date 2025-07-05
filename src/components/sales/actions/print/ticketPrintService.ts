
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
      .shop-info {
        font-size: 11px;
        margin-bottom: 15px;
      }
      .center { text-align: center; }
      .left { text-align: left; }
      .right { text-align: right; }
      .bold { font-weight: bold; }
      .red { color: #d32f2f; }
      .discount { color: #f57c00; }
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
      .table-header {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
        font-weight: bold;
        border-bottom: 1px solid #000;
        padding-bottom: 2px;
        text-align: left;
        font-size: 10px;
      }
      .header-article {
        width: 80px;
        flex-shrink: 0;
      }
      .header-qty {
        width: 25px;
        text-align: center;
        flex-shrink: 0;
      }
      .header-remise {
        width: 35px;
        text-align: center;
        flex-shrink: 0;
      }
      .header-pu {
        width: 35px;
        text-align: right;
        flex-shrink: 0;
      }
      .header-total {
        width: 40px;
        text-align: right;
        flex-shrink: 0;
      }
      .article-line {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
        text-align: left;
        align-items: center;
      }
      .article-name {
        width: 80px;
        flex-shrink: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 10px;
      }
      .article-qty {
        width: 25px;
        text-align: center;
        flex-shrink: 0;
        font-size: 10px;
      }
      .article-remise {
        width: 35px;
        text-align: center;
        flex-shrink: 0;
        font-size: 10px;
        color: #f57c00;
      }
      .article-price {
        width: 35px;
        text-align: right;
        flex-shrink: 0;
        font-size: 10px;
      }
      .article-total {
        width: 40px;
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
      .discount-total {
        color: #f57c00;
        font-weight: bold;
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
  let articlesHtml = `
    <div class="table-header">
      <span class="header-article">Article</span>
      <span class="header-qty">Qté</span>
      <span class="header-remise">Remise</span>
      <span class="header-pu">PU</span>
      <span class="header-total">Total</span>
    </div>
  `;

  if (facture.lignes_facture && facture.lignes_facture.length > 0) {
    articlesHtml += facture.lignes_facture.map((ligne, index) => {
      const remiseUnitaire = ligne.remise_unitaire || 0;
      const remiseFormatted = remiseUnitaire > 0 ? Math.round(remiseUnitaire) : '0';
      const prixNet = ligne.prix_unitaire;
      
      return `
        <div class="article-line">
          <span class="article-name">${ligne.article?.nom || 'Article'}</span>
          <span class="article-qty">${ligne.quantite}</span>
          <span class="article-remise">${remiseFormatted > 0 ? remiseFormatted : '0'}</span>
          <span class="article-price">${Math.round(prixNet)}</span>
          <span class="article-total">${Math.round(ligne.montant_ligne)}</span>
        </div>
      `;
    }).join('');
  } else {
    articlesHtml += `
      <div class="article-line">
        <span class="article-name">Vente globale</span>
        <span class="article-qty">1</span>
        <span class="article-remise">0</span>
        <span class="article-price">${Math.round(facture.montant_ttc)}</span>
        <span class="article-total">${Math.round(facture.montant_ttc)}</span>
      </div>
    `;
  }
  
  return articlesHtml;
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
        <div>Livrés : ${totalQuantiteLivree} | Restants : ${articlesRestants}</div>
      </div>
    `;
  }
  
  return '';
};

const generateDiscountSection = (facture: FactureVente): string => {
  // Calculer le total des remises
  let totalRemise = 0;
  let montantBrut = 0;
  
  if (facture.lignes_facture && facture.lignes_facture.length > 0) {
    facture.lignes_facture.forEach(ligne => {
      const remiseUnitaire = ligne.remise_unitaire || 0;
      const prixBrut = ligne.prix_unitaire_brut || ligne.prix_unitaire;
      const quantite = ligne.quantite;
      
      totalRemise += remiseUnitaire * quantite;
      montantBrut += prixBrut * quantite;
    });
  } else if (facture.remise_totale && facture.remise_totale > 0) {
    totalRemise = facture.remise_totale;
    montantBrut = facture.montant_ttc + totalRemise;
  }
  
  if (totalRemise > 0) {
    return `
      <div class="total-line">
        <span>Montant brut</span>
        <span>${Math.round(montantBrut)} F</span>
      </div>
      <div class="total-line discount-total">
        <span>Remise totale</span>
        <span>-${Math.round(totalRemise)} F</span>
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
          <div class="shop-info">Tel : 623 26 87 81</div>
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
          ${generateDiscountSection(facture)}
          
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
