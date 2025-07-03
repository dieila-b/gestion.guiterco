
import type { FactureVente } from '@/types/sales';
import { formatCurrency } from '@/lib/currency';

export const generateArticlesSection = (facture: FactureVente): string => {
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
      
      // Utiliser les vraies données de remise sauvegardées
      const remiseUnitaire = ligne.remise_unitaire || 0;
      const prixBrut = ligne.prix_unitaire_brut || ligne.prix_unitaire;
      const prixNet = ligne.prix_unitaire; // Prix après remise
      
      console.log('📄 Ligne PDF:', {
        article: ligne.article?.nom,
        prix_brut: prixBrut,
        remise_unitaire: remiseUnitaire,
        prix_net: prixNet,
        montant_ligne: ligne.montant_ligne
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
    articlesHtml += `
      <tr>
        <td class="product-name">Vente globale</td>
        <td>${formatCurrency(facture.montant_ttc)}</td>
        <td>0 GNF</td>
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
