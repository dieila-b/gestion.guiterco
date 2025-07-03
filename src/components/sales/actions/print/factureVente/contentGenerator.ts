
import type { FactureVente } from '@/types/sales';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { calculateTotalPaid, calculateRemainingAmount } from '../printUtils';
import { generateFactureVenteStyles } from './styles';
import { generateArticlesSection } from './articlesSection';
import { getPaymentStatus, getDeliveryStatusInfo } from './statusHelpers';
import { numberToWords } from './utils';

export const generateFactureVenteContent = (facture: FactureVente): string => {
  const totalPaid = calculateTotalPaid(facture);
  const remainingAmount = calculateRemainingAmount(facture);
  const paymentStatus = getPaymentStatus(facture);
  const deliveryStatus = getDeliveryStatusInfo(facture);
  
  // Calculer les montants avec remises
  const totalRemise = facture.remise_totale || 0;
  
  // Calculer le montant HT avant remise
  let montantHTAvantRemise = facture.montant_ht;
  if (facture.lignes_facture && facture.lignes_facture.length > 0) {
    montantHTAvantRemise = facture.lignes_facture.reduce((total, ligne) => {
      const prixBrut = ligne.prix_unitaire_brut || ligne.prix_unitaire;
      return total + (prixBrut * ligne.quantite);
    }, 0);
  }
  
  // Calculer le montant TTC avant remise
  const montantTTCAvantRemise = montantHTAvantRemise * (1 + (facture.taux_tva || 20) / 100);

  console.log('💰 Calculs PDF facture:', {
    montantHTAvantRemise,
    montantTTCAvantRemise,
    totalRemise,
    montant_ht_final: facture.montant_ht,
    montant_ttc_final: facture.montant_ttc
  });

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
              ${totalRemise > 0 ? `
                <div class="total-line">
                  <span>Montant HT avant remise</span>
                  <span>${formatCurrency(montantHTAvantRemise)}</span>
                </div>
                <div class="total-line">
                  <span>Total des remises</span>
                  <span class="discount-amount">-${formatCurrency(totalRemise)}</span>
                </div>
                <div class="total-line">
                  <span>Montant HT après remise</span>
                  <span>${formatCurrency(facture.montant_ht)}</span>
                </div>
                <div class="total-line">
                  <span>TVA (${facture.taux_tva || 20}%)</span>
                  <span>${formatCurrency(facture.tva)}</span>
                </div>
              ` : `
                <div class="total-line">
                  <span>Montant HT</span>
                  <span>${formatCurrency(facture.montant_ht)}</span>
                </div>
                <div class="total-line">
                  <span>TVA (${facture.taux_tva || 20}%)</span>
                  <span>${formatCurrency(facture.tva)}</span>
                </div>
              `}
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
