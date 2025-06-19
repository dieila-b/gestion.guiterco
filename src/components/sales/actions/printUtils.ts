
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
  // Calculer les totaux des versements pour cette facture
  const totalPaid = facture.versements?.reduce((sum, versement) => sum + versement.montant, 0) || 0;
  const remainingAmount = Math.max(0, facture.montant_ttc - totalPaid);
  
  // Générer un numéro de ticket basé sur la facture
  const ticketNumber = facture.numero_facture.replace('FA-', '').replace(/-/g, '');
  
  // Obtenir la date et heure actuelles
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  const timeStr = now.toLocaleTimeString('fr-FR');
  
  const ticketContent = `
    <html>
      <head>
        <title>Ticket ${ticketNumber}</title>
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
          .center { text-align: center; }
          .left { text-align: left; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .line { 
            border-top: 1px dashed #000; 
            margin: 8px 0; 
            width: 100%;
          }
          .shop-name {
            font-size: 16px;
            font-weight: bold;
            margin: 5px 0;
          }
          .shop-info {
            font-size: 11px;
            margin-bottom: 15px;
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
          }
          .article-qty {
            width: 15px;
            flex-shrink: 0;
          }
          .article-name {
            flex: 1;
            padding: 0 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .article-price {
            width: 60px;
            text-align: right;
            flex-shrink: 0;
          }
          .article-total {
            width: 60px;
            text-align: right;
            flex-shrink: 0;
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
          .barcode {
            font-family: 'Libre Barcode 128', monospace;
            font-size: 32px;
            margin: 15px 0;
            letter-spacing: 1px;
          }
          .footer {
            margin-top: 15px;
            font-size: 11px;
          }
          .datetime {
            font-size: 10px;
            margin: 10px 0;
          }
          @media print {
            body { width: 280px; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="shop-name">DEMO SHOP</div>
        <div class="shop-info">Tel : +225 05 55 95 45 33</div>
        
        <div class="line"></div>
        
        <div class="ticket-header">
          <div>Client : ${facture.client?.nom || 'Client Comptoir'}</div>
          <div>Ticket : ${ticketNumber}</div>
        </div>
        
        <div class="line"></div>
        
        <div class="articles-table">
          ${facture.lignes_facture?.map((ligne, index) => `
            <div class="article-line">
              <span class="article-qty">${ligne.quantite}</span>
              <span class="article-name">${ligne.article?.nom || 'Article'}</span>
              <span class="article-price">${Math.round(ligne.prix_unitaire)}</span>
              <span class="article-total">${Math.round(ligne.montant_ligne)}</span>
            </div>
          `).join('') || `
            <div class="article-line">
              <span class="article-qty">1</span>
              <span class="article-name">Vente globale</span>
              <span class="article-price">${Math.round(facture.montant_ttc)}</span>
              <span class="article-total">${Math.round(facture.montant_ttc)}</span>
            </div>
          `}
        </div>
        
        <div class="line"></div>
        
        <div class="totals">
          <div class="total-line grand-total">
            <span>Total</span>
            <span>${Math.round(facture.montant_ttc)} F</span>
          </div>
          
          ${totalPaid > 0 ? `
            <div class="total-line payment-info">
              <span>Montant payé</span>
              <span>${Math.round(totalPaid)} F</span>
            </div>
          ` : ''}
          
          ${remainingAmount > 0 ? `
            <div class="total-line payment-info remaining-amount">
              <span>Reste à payer</span>
              <span>${Math.round(remainingAmount)} F</span>
            </div>
          ` : ''}
        </div>
        
        <div class="center barcode">||||| |||| | |||| ||||| | ||||</div>
        
        <div class="center datetime">${dateStr} ${timeStr}</div>
        <div class="center footer">Merci à la prochaine</div>
      </body>
    </html>
  `;

  const ticketWindow = window.open('', '_blank');
  if (ticketWindow) {
    ticketWindow.document.write(ticketContent);
    ticketWindow.document.close();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    setTimeout(() => {
      ticketWindow.print();
    }, 250);
  }
};
