
import type { FactureVente } from '@/types/sales';
import { formatCurrency } from '@/lib/currency';

export const generateArticlesSection = (facture: FactureVente): string => {
  console.log('📋 Génération section articles avec remises');
  
  let articlesHtml = `
    <table class="articles-table">
      <thead>
        <tr>
          <th>PRODUIT</th>
          <th>PRIX UNITAIRE</th>
          <th>REMISE</th>
          <th>PRIX NET</th>
          <th>QTÉ</th>
          <th>LIVRÉ</th>
          <th>RESTANT</th>
          <th>TOTAL</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (facture.lignes_facture && facture.lignes_facture.length > 0) {
    articlesHtml += facture.lignes_facture.map((ligne) => {
      const delivered = ligne.quantite_livree || 0;
      const ordered = ligne.quantite || 0;
      const remaining = Math.max(0, ordered - delivered);
      
      // Récupération et validation des données de remise
      const remiseUnitaire = (typeof ligne.remise_unitaire === 'number' && ligne.remise_unitaire > 0) ? ligne.remise_unitaire : 0;
      const prixBrut = ligne.prix_unitaire_brut || ligne.prix_unitaire || 0;
      const prixNet = ligne.prix_unitaire || 0;
      
      console.log('📄 Ligne article avec remise:', {
        article: ligne.article?.nom,
        prix_brut: prixBrut,
        remise_unitaire: remiseUnitaire,
        prix_net: prixNet,
        montant_ligne: ligne.montant_ligne,
        quantite: ordered
      });
      
      return `
        <tr>
          <td class="product-name">${ligne.article?.nom || 'Article'}</td>
          <td>${formatCurrency(prixBrut)}</td>
          <td class="discount-amount">${remiseUnitaire > 0 ? formatCurrency(remiseUnitaire) : '0 GNF'}</td>
          <td>${formatCurrency(prixNet)}</td>
          <td>${ordered}</td>
          <td class="quantity-delivered">${delivered}</td>
          <td class="quantity-remaining">${remaining}</td>
          <td>${formatCurrency(ligne.montant_ligne)}</td>
        </tr>
      `;
    }).join('');
  } else {
    // Cas de vente globale - vérifier s'il y a une remise
    const remiseGlobale = facture.remise_totale || 0;
    const montantBrut = facture.montant_ttc + remiseGlobale;
    
    console.log('📋 Vente globale avec remise:', {
      remise_globale: remiseGlobale,
      montant_brut: montantBrut,
      montant_ttc: facture.montant_ttc
    });
    
    articlesHtml += `
      <tr>
        <td class="product-name">Vente globale</td>
        <td>${formatCurrency(remiseGlobale > 0 ? montantBrut : facture.montant_ttc)}</td>
        <td class="discount-amount">${remiseGlobale > 0 ? formatCurrency(remiseGlobale) : '0 GNF'}</td>
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
