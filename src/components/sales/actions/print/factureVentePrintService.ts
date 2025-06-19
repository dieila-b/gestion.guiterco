import type { FactureVente } from '@/types/sales';
import { openPrintWindow } from './basePrintService';
import { 
  calculateTotalPaid, 
  calculateRemainingAmount, 
  getCurrentDateTime 
} from './printUtils';
import { getActualDeliveryStatus } from '@/components/sales/table/StatusUtils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

const numberToWords = (num: number): string => {
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  
  if (num === 0) return 'zéro';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' cent' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
  
  return num.toString();
};

const generateFactureVenteStyles = (): string => {
  return `
    <style>
      @page {
        size: A4;
        margin: 15mm;
      }
      body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        padding: 0; 
        font-size: 11px;
        line-height: 1.3;
        color: #333;
      }
      .invoice-container {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
        padding: 15px;
      }
      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 15px;
      }
      .company-info {
        flex: 1;
        max-width: 50%;
      }
      .company-logo {
        width: 70px;
        height: 70px;
        margin-bottom: 10px;
        background: #f5f5f5;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ddd;
      }
      .company-logo img {
        max-width: 60px;
        max-height: 60px;
        object-fit: contain;
      }
      .company-name {
        font-size: 16px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 6px;
      }
      .company-details {
        font-size: 9px;
        line-height: 1.4;
        color: #666;
      }
      .invoice-info {
        flex: 1;
        max-width: 45%;
        text-align: right;
      }
      .invoice-title {
        font-size: 24px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 15px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .invoice-details {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 4px;
        border: 1px solid #e9ecef;
      }
      .invoice-details h3 {
        margin: 0 0 8px 0;
        font-size: 11px;
        color: #495057;
        text-transform: uppercase;
        font-weight: 600;
      }
      .invoice-details p {
        margin: 4px 0;
        font-size: 10px;
      }
      .client-section {
        margin: 15px 0;
        background: #e8f4fd;
        padding: 12px;
        border-radius: 4px;
        border-left: 3px solid #007bff;
      }
      .client-section h3 {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #0056b3;
        text-transform: uppercase;
        font-weight: 600;
      }
      .client-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .client-field {
        display: flex;
        align-items: center;
        font-size: 10px;
      }
      .client-field label {
        font-weight: 600;
        margin-right: 6px;
        color: #6c757d;
        min-width: 50px;
      }
      .articles-section {
        margin: 20px 0;
      }
      .articles-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #dee2e6;
        margin-bottom: 15px;
      }
      .articles-table th {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        padding: 8px 6px;
        text-align: center;
        font-weight: 600;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        border: 1px solid #0056b3;
      }
      .articles-table td {
        padding: 6px 4px;
        border: 1px solid #dee2e6;
        font-size: 9px;
        text-align: center;
      }
      .articles-table tbody tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      .articles-table tbody tr:hover {
        background-color: #e3f2fd;
      }
      .product-name {
        text-align: left !important;
        font-weight: 500;
        color: #2c3e50;
      }
      .quantity-delivered {
        color: #28a745;
        font-weight: 600;
      }
      .quantity-remaining {
        color: #dc3545;
        font-weight: 600;
      }
      .totals-section {
        display: flex;
        justify-content: space-between;
        margin: 20px 0;
        gap: 20px;
      }
      .totals-left {
        flex: 1;
      }
      .totals-right {
        width: 280px;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 12px;
      }
      .totals-right h4 {
        margin: 0 0 8px 0;
        font-size: 11px;
        color: #495057;
        text-transform: uppercase;
        font-weight: 600;
        text-align: center;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 4px;
      }
      .total-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 10px;
      }
      .total-line.final {
        font-weight: bold;
        font-size: 12px;
        color: #2c3e50;
        border-top: 1px solid #495057;
        padding-top: 8px;
        margin-top: 8px;
      }
      .status-section {
        display: flex;
        gap: 15px;
        margin: 20px 0;
      }
      .status-box {
        flex: 1;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .status-box h4 {
        margin: 0 0 8px 0;
        font-size: 11px;
        color: #495057;
        text-transform: uppercase;
        font-weight: 600;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 4px;
      }
      .status-info {
        margin-bottom: 6px;
        font-size: 10px;
      }
      .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 8px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-left: 6px;
      }
      .badge-partial {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
      }
      .badge-paid {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      .badge-unpaid {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
      .badge-delivered {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      .badge-pending {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
      }
      .highlight-messages {
        margin: 15px 0;
      }
      .message-box {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 4px;
        padding: 8px;
        margin: 6px 0;
        font-size: 9px;
        color: #856404;
        display: flex;
        align-items: center;
      }
      .message-box::before {
        content: "ℹ️";
        margin-right: 6px;
        font-size: 12px;
      }
      .observations-section {
        margin: 15px 0;
        background: #f8f9fa;
        padding: 10px;
        border-radius: 4px;
        border-left: 3px solid #6c757d;
      }
      .observations-section h4 {
        margin: 0 0 6px 0;
        font-size: 11px;
        color: #495057;
        font-weight: 600;
      }
      .legal-mention {
        margin-top: 20px;
        padding: 12px;
        background: #e9ecef;
        border-radius: 4px;
        text-align: center;
        font-size: 10px;
        font-weight: 500;
        color: #495057;
        font-style: italic;
        border: 1px dashed #adb5bd;
      }
      @media print {
        body { margin: 0; padding: 5px; }
        .no-print { display: none !important; }
        .invoice-container { max-width: none; padding: 0; }
      }
    </style>
  `;
};

const generateArticlesSection = (facture: FactureVente): string => {
  let articlesHtml = `
    <table class="articles-table">
      <thead>
        <tr>
          <th>Produit</th>
          <th>Prix unitaire</th>
          <th>Remise</th>
          <th>Prix net</th>
          <th>Qté</th>
          <th>Livré</th>
          <th>Restant</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (facture.lignes_facture && facture.lignes_facture.length > 0) {
    articlesHtml += facture.lignes_facture.map((ligne) => {
      const delivered = ligne.quantite_livree || 0;
      const ordered = ligne.quantite || 0;
      const remaining = Math.max(0, ordered - delivered);
      
      return `
        <tr>
          <td class="product-name">${ligne.article?.nom || 'Article'}</td>
          <td>${formatCurrency(ligne.prix_unitaire)}</td>
          <td>0</td>
          <td>${formatCurrency(ligne.prix_unitaire)}</td>
          <td>${ordered}</td>
          <td class="quantity-delivered">${delivered}</td>
          <td class="quantity-remaining">${remaining}</td>
          <td>${formatCurrency(ligne.montant_ligne)}</td>
        </tr>
      `;
    }).join('');
  } else {
    articlesHtml += `
      <tr>
        <td class="product-name">Vente globale</td>
        <td>${formatCurrency(facture.montant_ttc)}</td>
        <td>0</td>
        <td>${formatCurrency(facture.montant_ttc)}</td>
        <td>1</td>
        <td class="quantity-delivered">1</td>
        <td class="quantity-remaining">0</td>
        <td>${formatCurrency(facture.montant_ttc)}</td>
      </tr>
    `;
  }
  
  articlesHtml += `
      </tbody>
    </table>
  `;
  
  return articlesHtml;
};

const getPaymentStatus = (facture: FactureVente) => {
  const totalPaid = calculateTotalPaid(facture);
  const montantTotal = facture.montant_ttc || 0;
  
  if (totalPaid === 0) {
    return { label: 'Impayé', badge: 'badge-unpaid' };
  } else if (totalPaid >= montantTotal) {
    return { label: 'Payé', badge: 'badge-paid' };
  } else {
    return { label: 'Partiellement payé', badge: 'badge-partial' };
  }
};

const getDeliveryStatusInfo = (facture: FactureVente) => {
  const deliveryStatus = getActualDeliveryStatus(facture);
  
  if (deliveryStatus === 'livree') {
    return { label: 'Livré', badge: 'badge-delivered' };
  } else if (deliveryStatus === 'partiellement_livree') {
    return { label: 'Partiellement livré', badge: 'badge-partial' };
  } else {
    return { label: 'En attente', badge: 'badge-pending' };
  }
};

const generateFactureVenteContent = (facture: FactureVente): string => {
  const totalPaid = calculateTotalPaid(facture);
  const remainingAmount = calculateRemainingAmount(facture);
  const paymentStatus = getPaymentStatus(facture);
  const deliveryStatus = getDeliveryStatusInfo(facture);

  return `
    <html>
      <head>
        <title>Facture ${facture.numero_facture}</title>
        ${generateFactureVenteStyles()}
      </head>
      <body>
        <div class="invoice-container">
          <!-- En-tête avec logo et informations société -->
          <div class="header-section">
            <div class="company-info">
              <div class="company-logo">
                <img src="/lovable-uploads/932def2b-197f-4495-8a0a-09c753a4a892.png" alt="U CONNEXT Logo" />
              </div>
              <div class="company-name">U CONNEXT</div>
              <div class="company-details">
                <strong>Adresse :</strong> Madina-Gare routière Kankan C/Matam<br/>
                <strong>Téléphone :</strong> 623 26 87 81<br/>
                <strong>Email :</strong> uconnext@gmail.com
              </div>
            </div>
            
            <div class="invoice-info">
              <div class="invoice-details">
                <h3>Informations de la facture</h3>
                <p><strong>Date :</strong> ${format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}</p>
                <p><strong>N° Facture :</strong> ${facture.numero_facture}</p>
                ${facture.date_echeance ? `<p><strong>Échéance :</strong> ${format(new Date(facture.date_echeance), 'dd/MM/yyyy', { locale: fr })}</p>` : ''}
              </div>
            </div>
          </div>

          <div class="invoice-title">Facture de Vente</div>

          <!-- Informations client -->
          <div class="client-section">
            <h3>Informations Client</h3>
            <div class="client-info">
              <div class="client-field">
                <label>Nom :</label>
                <span>${facture.client?.nom || 'Client non spécifié'}</span>
              </div>
              <div class="client-field">
                <label>Code :</label>
                <span>${facture.client?.id?.substring(0, 8) || 'N/A'}</span>
              </div>
              <div class="client-field">
                <label>Téléphone :</label>
                <span>${facture.client?.telephone || 'N/A'}</span>
              </div>
              <div class="client-field">
                <label>Email :</label>
                <span>${facture.client?.email || 'N/A'}</span>
              </div>
              ${facture.client?.adresse ? `
                <div class="client-field" style="grid-column: 1 / -1;">
                  <label>Adresse :</label>
                  <span>${facture.client.adresse}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Tableau des articles -->
          <div class="articles-section">
            ${generateArticlesSection(facture)}
          </div>

          <!-- Section totaux -->
          <div class="totals-section">
            <div class="totals-left"></div>
            <div class="totals-right">
              <h4>Récapitulatif des montants</h4>
              <div class="total-line">
                <span>Montant Total</span>
                <span>${formatCurrency(facture.montant_ttc)}</span>
              </div>
              <div class="total-line">
                <span>Remise</span>
                <span>${formatCurrency(0)}</span>
              </div>
              <div class="total-line final">
                <span>Net à Payer</span>
                <span>${formatCurrency(facture.montant_ttc)}</span>
              </div>
            </div>
          </div>

          <!-- Section statuts -->
          <div class="status-section">
            <div class="status-box">
              <h4>Statut de paiement</h4>
              <div class="status-info">
                <strong>Statut :</strong>
                <span class="status-badge ${paymentStatus.badge}">
                  ${paymentStatus.label}
                </span>
              </div>
              <div class="status-info">
                <strong>Montant payé :</strong> ${formatCurrency(totalPaid)}
              </div>
              <div class="status-info">
                <strong>Reste à payer :</strong> ${formatCurrency(remainingAmount)}
              </div>
            </div>
            
            <div class="status-box">
              <h4>Statut de livraison</h4>
              <div class="status-info">
                <strong>Statut :</strong>
                <span class="status-badge ${deliveryStatus.badge}">
                  ${deliveryStatus.label}
                </span>
              </div>
            </div>
          </div>

          <!-- Messages informatifs -->
          <div class="highlight-messages">
            ${paymentStatus.label === 'Partiellement payé' ? `
              <div class="message-box">
                Un paiement partiel a été effectué sur cette facture.
              </div>
            ` : ''}
            
            ${deliveryStatus.label === 'Partiellement livré' ? `
              <div class="message-box">
                Cette commande a été partiellement livrée.
              </div>
            ` : ''}
          </div>

          <!-- Observations -->
          ${facture.observations ? `
            <div class="observations-section">
              <h4>Observations :</h4>
              <p>${facture.observations}</p>
            </div>
          ` : ''}

          <!-- Mention légale -->
          <div class="legal-mention">
            Arrêtée la présente facture à la somme de <strong>${numberToWords(Math.floor(facture.montant_ttc))} francs guinéens</strong>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const printFactureVente = (facture: FactureVente): void => {
  const content = generateFactureVenteContent(facture);
  openPrintWindow(content, `Facture ${facture.numero_facture}`);
};
