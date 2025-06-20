
import React from 'react';

const ArticleMarginTableFooter = () => {
  return (
    <div className="p-4 bg-muted/20 border-t text-sm text-muted-foreground">
      <p><strong>Frais BC*</strong> = Frais issus des Bons de Commande (répartis proportionnellement par montant de ligne)</p>
      <p><strong>Frais Total</strong> = Frais Direct + Frais BC</p>
      <p>Utilisez le bouton "Debug Frais BC" pour analyser les calculs en détail dans la console.</p>
      <p>Le bouton "Rafraîchir" recharge les données depuis le cache.</p>
      <p>Le bouton "Recalculer Vue" force le recalcul complet de la vue des marges.</p>
    </div>
  );
};

export default ArticleMarginTableFooter;
