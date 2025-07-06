
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
  console.log('🧾 Génération facture avec remises - START');
  console.log('📋 Données facture complètes:', {
    id: facture.id,
    numero_facture: facture.numero_facture,
    client: facture.client?.nom,
    lignes_count: facture.lignes_facture?.length || 0,
    montant_ttc: facture.montant_ttc,
    remise_totale: facture.remise_totale
  });
  
  const totalPaid = calculateTotalPaid(facture);
  const remainingAmount = calculateRemainingAmount(facture);
  const paymentStatus = getPaymentStatus(facture);
  const deliveryStatus = getDeliveryStatusInfo(facture);
  
  // Calcul détaillé des remises avec logs
  let totalRemiseCalculee = 0;
  let montantTotalAvantRemise = 0;
  let montantTotalApresRemise = 0;
  
  console.log('💰 Calcul détaillé des remises...');
  
  if (facture.lignes_facture && facture.lignes_facture.length > 0) {
    // Calcul ligne par ligne
    facture.lignes_facture.forEach((ligne, index) => {
      const remiseUnitaire = ligne.remise_unitaire || 0;
      const remisePourcentage = ligne.remise_pourcentage || 0;
      const prixBrut = ligne.prix_unitaire_brut || ligne.prix_unitaire || 0;
      const prixNet = ligne.prix_unitaire || 0;
      const quantite = ligne.quantite || 0;
      
      console.log(`📄 Ligne ${index + 1} - calcul remise:`, {
        article: ligne.article?.nom,
        prix_brut: prixBrut,
        prix_net: prixNet,
        remise_unitaire: remiseUnitaire,
        remise_pourcentage: remisePourcentage,
        quantite: quantite,
        montant_ligne: ligne.montant_ligne
      });
      
      // Montant brut de la ligne
      const montantBrutLigne = prixBrut * quantite;
      montantTotalAvantRemise += montantBrutLigne;
      
      // Calcul de la remise pour cette ligne
      let remiseLigne = 0;
      if (remiseUnitaire > 0) {
        // Remise unitaire directe
        remiseLigne = remiseUnitaire * quantite;
      } else if (remisePourcentage > 0) {
        // Remise en pourcentage
        remiseLigne = (montantBrutLigne * remisePourcentage) / 100;
      }
      
      totalRemiseCalculee += remiseLigne;
      montantTotalApresRemise += ligne.montant_ligne || 0;
      
      console.log(`📄 Ligne ${index + 1} - résultat:`, {
        montant_brut_ligne: montantBrutLigne,
        remise_ligne: remiseLigne,
        montant_apres_remise: ligne.montant_ligne
      });
    });
  } else {
    // Cas de vente globale sans lignes détaillées
    montantTotalAvantRemise = facture.montant_ttc || 0;
    totalRemiseCalculee = facture.remise_totale || 0;
    montantTotalApresRemise = facture.montant_ttc || 0;
    
    if (totalRemiseCalculee > 0) {
      montantTotalAvantRemise = montantTotalApresRemise + totalRemiseCalculee;
    }
  }
  
  // Utilisation de la remise totale de la facture si disponible et plus élevée
  if (facture.remise_totale && facture.remise_totale > totalRemiseCalculee) {
    console.log('🔄 Utilisation remise_totale de la facture:', facture.remise_totale);
    totalRemiseCalculee = facture.remise_totale;
    if (montantTotalAvantRemise === 0) {
      montantTotalAvantRemise = facture.montant_ttc + totalRemiseCalculee;
    }
  }
  
  const netAPayer = facture.montant_ttc || 0;

  console.log('💰 Résultats finaux des calculs:', {
    montantTotalAvantRemise,
    totalRemiseCalculee,
    montantTotalApresRemise,
    netAPayer,
    hasRemise: totalRemiseCalculee > 0.01
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
                <h3>INFORMATIONS DE LA FACTURE</h3>
                <p><strong>Date :</strong> ${format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}</p>
                <p><strong>N° Facture :</strong> ${facture.numero_facture}</p>
                ${facture.date_echeance ? `<p><strong>Échéance :</strong> ${format(new Date(facture.date_echeance), 'dd/MM/yyyy', { locale: fr })}</p>` : ''}
              </div>
            </div>
          </div>

          <div class="invoice-title">FACTURE DE VENTE</div>

          <!-- Informations client -->
          <div class="client-section">
            <h3>INFORMATIONS CLIENT</h3>
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
            </div>
          </div>

          <!-- Tableau des articles -->
          <div class="articles-section">
            ${generateArticlesSection(facture)}
          </div>

          <!-- Section récapitulatif des montants avec détail des remises -->
          <div class="totals-section">
            <div class="totals-left"></div>
            <div class="totals-right">
              <h4>RÉCAPITULATIF DES MONTANTS</h4>
              
              ${totalRemiseCalculee > 0.01 ? `
                <div class="total-line">
                  <span>Montant Total Brut</span>
                  <span>${formatCurrency(montantTotalAvantRemise)}</span>
                </div>
                <div class="total-line discount-line">
                  <span>Remise Totale</span>
                  <span class="discount-amount">-${formatCurrency(totalRemiseCalculee)}</span>
                </div>
                <div class="total-line">
                  <span>Montant après Remise</span>
                  <span>${formatCurrency(montantTotalApresRemise)}</span>
                </div>
              ` : `
                <div class="total-line">
                  <span>Montant Total</span>
                  <span>${formatCurrency(montantTotalAvantRemise)}</span>
                </div>
              `}
              
              <div class="total-line final">
                <span>Net à Payer</span>
                <span>${formatCurrency(netAPayer)}</span>
              </div>
              
              ${totalRemiseCalculee > 0.01 ? `
                <div class="total-line economics">
                  <span>Économie réalisée</span>
                  <span class="discount-amount">${formatCurrency(totalRemiseCalculee)}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Section statuts -->
          <div class="status-section">
            <div class="status-box">
              <h4>STATUT DE PAIEMENT</h4>
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
              <h4>STATUT DE LIVRAISON</h4>
              <div class="status-info">
                <strong>Statut :</strong>
                <span class="status-badge ${deliveryStatus.badge}">
                  ${deliveryStatus.label}
                </span>
              </div>
            </div>
          </div>

          <!-- Observations -->
          ${facture.observations ? `
            <div class="observations-section">
              <h4>Observations :</h4>
              <p>${facture.observations}</p>
            </div>
          ` : ''}

          <!-- Phrase finale avec montant en lettres -->
          <div class="legal-mention">
            Arrêtée la présente facture à la somme de <strong>${numberToWords(Math.floor(netAPayer))} francs guinéens</strong>
            ${totalRemiseCalculee > 0.01 ? `<br/><em>dont ${formatCurrency(totalRemiseCalculee)} de remise accordée</em>` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
};
