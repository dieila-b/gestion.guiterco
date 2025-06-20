
import React from 'react';

const ArticleMarginTableFooter = () => {
  return (
    <div className="p-4 bg-muted/20 border-t text-sm text-muted-foreground">
      <p><strong>Frais BC*</strong> = Frais issus des Bons de Commande (répartis proportionnellement par montant de ligne)</p>
      <p><strong>Frais Total</strong> = Frais Direct + Frais BC</p>
      <p><strong>Debug Vue Marges</strong> = Analyse spécifique des frais dans la vue des marges</p>
      <p>Le bouton "Debug Frais BC" analyse les calculs détaillés. "Debug Vue Marges" vérifie les données de la vue.</p>
      <p>Le bouton "Rafraîchir" recharge les données depuis le cache. "Recalculer Vue" force le recalcul complet.</p>
    </div>
  );
};

export default ArticleMarginTableFooter;
