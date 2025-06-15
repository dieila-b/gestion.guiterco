
import React from 'react';
import type { FactureVente } from '@/types/sales';

interface ArticleCountCellProps {
  facture: FactureVente;
}

const ArticleCountCell = ({ facture }: ArticleCountCellProps) => {
  // Priorité 1: utiliser nb_articles si disponible et valide
  if (typeof facture.nb_articles === 'number' && facture.nb_articles > 0) {
    console.log('📦 Utilisation nb_articles:', facture.nb_articles, 'pour facture:', facture.numero_facture);
    return (
      <span className="font-medium text-lg text-blue-600">
        {facture.nb_articles}
      </span>
    );
  }
  
  // Priorité 2: compter les lignes_facture si disponibles
  if (facture.lignes_facture && Array.isArray(facture.lignes_facture) && facture.lignes_facture.length > 0) {
    const count = facture.lignes_facture.length;
    console.log('📦 Utilisation lignes_facture.length:', count, 'pour facture:', facture.numero_facture);
    return (
      <span className="font-medium text-lg text-blue-600">
        {count}
      </span>
    );
  }
  
  // Si aucune donnée n'est disponible
  console.log('📦 Aucun article trouvé pour facture:', facture.numero_facture, {
    nb_articles: facture.nb_articles,
    lignes_facture: facture.lignes_facture
  });
  
  return (
    <span className="font-medium text-lg text-gray-400">
      0
    </span>
  );
};

export default ArticleCountCell;
