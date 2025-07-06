
import type { FactureVente } from '@/types/sales';
import { formatCurrency } from '@/lib/currency';

export const generateArticlesSection = (facture: FactureVente): string => {
  console.log('📋 Génération section articles avec remises détaillées');
  
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
      
      // Extraction détaillée des données de remise
      const remiseUnitaire = ligne.remise_unitaire || 0;
      const remisePourcentage = ligne.remise_pourcentage || 0;
      const prixBrut = ligne.prix_unitaire_brut || ligne.prix_unitaire || 0;
      const prixNet = ligne.prix_unitaire || 0;
      
      console.log('📄 Détail ligne avec remise:', {
        article: ligne.article?.nom,
        prix_brut: prixBrut,
        prix_net: prixNet,
        remise_unitaire: remiseUnitaire,
        remise_pourcentage: remisePourcentage,
        quantite: ordered,
        montant_ligne: ligne.montant_ligne
      });
      
      // Affichage de la remise (priorité à la remise unitaire)
      let affichageRemise = '0 GNF';
      if (remiseUnitaire > 0) {
        affichageRemise = formatCurrency(remiseUnitaire);
      } else if (remisePourcentage > 0) {
        affichageRemise = `${remisePourcentage}%`;
      }
      
      return `
        <tr>
          <td class="product-name">${ligne.article?.nom || 'Article'}</td>
          <td>${formatCurrency(prixBrut)}</td>
          <td class="discount-amount">${affichageRemise}</td>
          <td>${formatCurrency(prixNet)}</td>
          <td>${ordered}</td>
          <td class="quantity-delivered">${delivered}</td>
          <td class="quantity-remaining">${remaining}</td>
          <td>${formatCurrency(ligne.montant_ligne)}</td>
        </tr>
      `;
    }).join('');
  } else {
    // Cas de vente globale
    const remiseGlobale = facture.remise_totale || 0;
    const montantBrut = facture.montant_ttc + remiseGlobale;
    
    console.log('📋 Vente globale avec remise globale:', {
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
