
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
  const changeAmount = Math.max(0, totalPaid - facture.montant_ttc);
  
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
            width: 300px; 
            margin: 0 auto; 
            font-size: 12px; 
            line-height: 1.3;
            padding: 10px;
            background: white;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { 
            border-top: 1px dashed #000; 
            margin: 5px 0; 
            width: 100%;
          }
          .logo {
            font-size: 16px;
            font-weight: bold;
            color: #d32f2f;
            margin-bottom: 5px;
          }
          .shop-name {
            font-size: 18px;
            font-weight: bold;
            margin: 5px 0;
          }
          .shop-info {
            font-size: 10px;
            margin-bottom: 10px;
          }
          .ticket-info {
            margin: 10px 0;
            font-size: 11px;
          }
          .article-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin: 10px 0 5px 0;
            font-size: 10px;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
          }
          .article-line {
            margin: 3px 0;
            font-size: 11px;
          }
          .article-qty {
            display: inline-block;
            width: 15px;
          }
          .article-name {
            display: inline-block;
            width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .article-price {
            display: inline-block;
            width: 50px;
            text-align: right;
          }
          .article-total {
            display: inline-block;
            width: 60px;
            text-align: right;
          }
          .totals {
            margin-top: 10px;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .grand-total {
            font-weight: bold;
            font-size: 13px;
            border-top: 1px solid #000;
            padding-top: 3px;
            margin-top: 5px;
          }
          .change-amount {
            color: red;
            font-weight: bold;
          }
          .barcode {
            text-align: center;
            font-family: 'Libre Barcode 128', monospace;
            font-size: 40px;
            margin: 10px 0;
            letter-spacing: 0;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 11px;
          }
          .datetime {
            font-size: 10px;
            margin: 10px 0;
          }
          @media print {
            body { width: 300px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="center logo">3AF Technology</div>
        <div class="center shop-name">DEMO SHOP</div>
        <div class="center shop-info">Tel : +225 05 55 95 45 33</div>
        
        <div class="line"></div>
        
        <div class="ticket-info">
          <div>Client : ${facture.client?.nom || 'CLIENT COMPTOIR'}</div>
          <div>N° Ticket : ${ticketNumber}</div>
        </div>
        
        <div class="article-header">
          <span style="width: 15px;">Qt</span>
          <span style="width: 140px;">Article</span>
          <span style="width: 50px; text-align: right;">PU</span>
          <span style="width: 60px; text-align: right;">Total</span>
        </div>
        
        ${facture.lignes_facture?.map(ligne => `
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
        
        <div class="totals">
          <div class="total-line grand-total">
            <span>Total</span>
            <span>${Math.round(facture.montant_ttc)} F</span>
          </div>
          <div class="total-line">
            <span>Net à payer</span>
            <span>${Math.round(facture.montant_ttc)} F</span>
          </div>
          ${changeAmount > 0 ? `
            <div class="total-line change-amount">
              <span>Monnaie client</span>
              <span>${Math.round(changeAmount)} F</span>
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
