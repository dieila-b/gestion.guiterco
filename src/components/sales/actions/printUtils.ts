import type { FactureVente } from '@/types/sales';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { calculatePaidAmount, calculateRemainingAmount, getActualPaymentStatus, getActualDeliveryStatus } from '../table/StatusUtils';

// Fonction pour convertir un nombre en toutes lettres (version simplifiée)
const numberToWords = (amount: number): string => {
  if (amount === 0) return 'zéro';
  
  const roundedAmount = Math.round(amount);
  if (roundedAmount < 1000) {
    return `${roundedAmount} francs guinéens`;
  } else if (roundedAmount < 1000000) {
    const thousands = Math.floor(roundedAmount / 1000);
    const remainder = roundedAmount % 1000;
    let result = `${thousands} mille`;
    if (remainder > 0) {
      result += ` ${remainder}`;
    }
    return result + ' francs guinéens';
  } else {
    const millions = Math.floor(roundedAmount / 1000000);
    const remainder = roundedAmount % 1000000;
    let result = `${millions} million`;
    if (remainder > 0) {
      result += ` ${Math.floor(remainder / 1000)} mille`;
    }
    return result + ' francs guinéens';
  }
};

export const printFacture = (facture: FactureVente) => {
  const paidAmount = calculatePaidAmount(facture);
  const remainingAmount = calculateRemainingAmount(facture);
  const paymentStatus = getActualPaymentStatus(facture);
  const deliveryStatus = getActualDeliveryStatus(facture);

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'payee': return 'Entièrement payé';
      case 'partiellement_payee': return 'Partiellement payé';
      default: return 'En attente';
    }
  };

  const getDeliveryStatusLabel = (status: string) => {
    switch (status) {
      case 'livree': return 'Entièrement livré';
      case 'partiellement_livree': return 'Partiellement livré';
      default: return 'En attente';
    }
  };

  const getPaymentStatusMessage = () => {
    if (paymentStatus === 'partiellement_payee') {
      return 'Un paiement partiel a été effectué sur cette facture.';
    } else if (paymentStatus === 'payee') {
      return 'Cette facture a été entièrement payée.';
    }
    return 'Aucun paiement effectué sur cette facture.';
  };

  const getDeliveryStatusMessage = () => {
    if (deliveryStatus === 'partiellement_livree') {
      return 'Cette commande a été partiellement livrée.';
    } else if (deliveryStatus === 'livree') {
      return 'Cette commande a été entièrement livrée.';
    }
    return 'Cette commande est en attente de livraison.';
  };

  // Génération du tableau des produits
  const generateProductsTable = () => {
    if (!facture.lignes_facture || facture.lignes_facture.length === 0) {
      return `
        <tr>
          <td colspan="8" style="border: 1px solid black; padding: 8px; text-align: center; color: #666;">
            Aucun article trouvé pour cette facture
          </td>
        </tr>
      `;
    }

    return facture.lignes_facture.map((ligne: any) => {
      const remise = 0; // À calculer selon votre logique métier
      const prixNet = ligne.prix_unitaire - remise;
      const livre = ligne.statut_livraison === 'livree' ? ligne.quantite : 0;
      const restant = ligne.quantite - livre;
      
      return `
        <tr>
          <td style="border: 1px solid black; padding: 8px;">${ligne.article?.nom || 'Article'}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: right;">${formatCurrency(ligne.prix_unitaire)}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: right;">${formatCurrency(remise)}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: right;">${formatCurrency(prixNet)}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: center;">${ligne.quantite}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: center; color: green;">${livre}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: center; color: orange;">${restant}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: right;">${formatCurrency(ligne.montant_ligne)}</td>
        </tr>
      `;
    }).join('');
  };

  const printContent = `
    <html>
      <head>
        <title>Facture ${facture.numero_facture}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: black;
            line-height: 1.4;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .company-info {
            display: flex;
            align-items: center;
          }
          .logo {
            width: 60px;
            height: 60px;
            background-color: #3b82f6;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            margin-right: 20px;
            font-size: 12px;
          }
          .company-details h1 {
            margin: 0;
            color: #3b82f6;
            font-size: 18px;
            font-weight: bold;
          }
          .company-details p {
            margin: 2px 0;
            font-size: 12px;
          }
          .facture-title {
            border: 2px solid black;
            padding: 10px 20px;
            font-size: 24px;
            font-weight: bold;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
          }
          .info-section h3 {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .info-section p {
            margin: 4px 0;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 12px;
          }
          td {
            font-size: 11px;
          }
          .summary {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 40px;
            margin-bottom: 20px;
          }
          .summary-amounts {
            border: 1px solid #ddd;
            padding: 15px;
          }
          .summary-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
          }
          .summary-total {
            border-top: 2px solid black;
            padding-top: 8px;
            font-weight: bold;
            font-size: 14px;
          }
          .amount-words {
            font-style: italic;
            font-size: 11px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-bottom: 20px;
          }
          .status-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .status-box {
            border: 2px solid black;
            padding: 15px;
          }
          .status-box h4 {
            margin: 0 0 10px 0;
            font-weight: bold;
            font-size: 12px;
          }
          .status-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11px;
          }
          .messages {
            margin-top: 20px;
          }
          .message {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 10px;
            margin-bottom: 10px;
            font-size: 11px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- En-tête avec informations de l'entreprise -->
        <div class="header">
          <div class="company-info">
            <div class="logo">Logo</div>
            <div class="company-details">
              <h1>Ets Aicha Business Alphaya</h1>
              <p>Madina-Gare routière Kankan C/Matam</p>
              <p>+224 613 98 11 24 / 625 72 76 93</p>
              <p>etsaichabusinessalphaya@gmail.com</p>
            </div>
          </div>
          <div class="facture-title">FACTURE</div>
        </div>

        <!-- Informations facture et client -->
        <div class="info-grid">
          <div class="info-section">
            <h3>FACTURE</h3>
            <p><strong>DATE:</strong> ${format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}</p>
            <p><strong>FACTURE N°:</strong> ${facture.numero_facture}</p>
          </div>
          <div class="info-section">
            <h3>CLIENT:</h3>
            <p><strong>Nom:</strong> ${facture.client?.nom || 'Client non spécifié'}</p>
            <p><strong>Téléphone:</strong> ${facture.client?.telephone || 'Non renseigné'}</p>
            <p><strong>Adresse:</strong> ${facture.client?.adresse || 'Non renseignée'}</p>
            <p><strong>Email:</strong> ${facture.client?.email || 'Non renseigné'}</p>
            <p><strong>Code:</strong> ${facture.client?.code_client || 'Non attribué'}</p>
          </div>
        </div>

        <!-- Tableau des produits -->
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th style="text-align: right;">Prix unitaire</th>
              <th style="text-align: right;">Remise</th>
              <th style="text-align: right;">Prix net</th>
              <th style="text-align: center;">Qté</th>
              <th style="text-align: center;">Livré</th>
              <th style="text-align: center;">Restant</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${generateProductsTable()}
          </tbody>
        </table>

        <!-- Résumé du montant -->
        <div class="summary">
          <div></div>
          <div class="summary-amounts">
            <div class="summary-line">
              <span><strong>Montant Total</strong></span>
              <span><strong>${formatCurrency(facture.montant_ttc)}</strong></span>
            </div>
            <div class="summary-line">
              <span>Remise</span>
              <span>${formatCurrency(facture.montant_ttc - facture.montant_ht - facture.tva)}</span>
            </div>
            <div class="summary-line summary-total">
              <span><strong>Net A Payer</strong></span>
              <span><strong>${formatCurrency(facture.montant_ttc)}</strong></span>
            </div>
          </div>
        </div>

        <!-- Montant en toutes lettres -->
        <div class="amount-words">
          <strong>Arrête la présente facture à la somme de: ${numberToWords(facture.montant_ttc)}</strong>
        </div>

        <!-- Statut de paiement et livraison -->
        <div class="status-grid">
          <div class="status-box">
            <h4>Statut de paiement</h4>
            <div class="status-line">
              <span>Statut:</span>
              <span><strong>${getPaymentStatusLabel(paymentStatus)}</strong></span>
            </div>
            <div class="status-line">
              <span>Montant payé:</span>
              <span><strong>${formatCurrency(paidAmount)}</strong></span>
            </div>
            <div class="status-line">
              <span>Montant restant:</span>
              <span><strong>${formatCurrency(remainingAmount)}</strong></span>
            </div>
          </div>
          
          <div class="status-box">
            <h4>Statut de livraison</h4>
            <div class="status-line">
              <span>Statut:</span>
              <span><strong>${getDeliveryStatusLabel(deliveryStatus)}</strong></span>
            </div>
          </div>
        </div>

        <!-- Messages personnalisés -->
        <div class="messages">
          ${(paymentStatus === 'partiellement_payee' || paymentStatus === 'payee') ? 
            `<div class="message">📝 ${getPaymentStatusMessage()}</div>` : ''}
          ${(deliveryStatus === 'partiellement_livree' || deliveryStatus === 'livree') ? 
            `<div class="message">🚚 ${getDeliveryStatusMessage()}</div>` : ''}
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
        <p class="bold">Total: ${formatCurrency(facture.montant_ttc)}</p>
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
